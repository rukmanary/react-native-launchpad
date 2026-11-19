"""Generate version-pinned patches in scratch directories, never in the package store."""
from pathlib import Path
import difflib
import json
import re
import subprocess
import tempfile

root = Path(__file__).resolve().parent.parent
packages = {
    "@nozbe/watermelondb": "native/android/build.gradle",
    "react-native-linear-gradient": "android/build.gradle",
    "react-native-biometrics": "android/build.gradle",
    "react-native-blurhash": "android/build.gradle",
    "react-native-fs": "android/build.gradle",
    "react-native-geolocation-service": "android/build.gradle",
    "react-native-date-picker": "android/build.gradle",
    "react-native-notifications": "lib/android/app/build.gradle",
}
token_file = "lib/android/app/src/main/java/com/wix/reactnativenotifications/fcm/FcmToken.java"  # pii-allow
(root / "patches").mkdir(exist_ok=True)
entries = []
for name, gradle_file in packages.items():
    package = root / "node_modules" / name
    version = json.loads((package / "package.json").read_text())["version"]
    paths = [gradle_file] + ([token_file] if name == "react-native-notifications" else [])
    originals = {file: (package / file).read_text() for file in paths}
    relative = "patches/" + name.replace("/", "__") + "@" + version + ".patch"
    destination = root / relative
    if destination.exists():
        with tempfile.TemporaryDirectory(prefix="starter-patch-") as temporary:
            for file, text in originals.items():
                scratch = Path(temporary) / file
                scratch.parent.mkdir(parents=True, exist_ok=True)
                scratch.write_text(text)
            reverse = ["git", "apply", "--reverse", str(destination)]
            check = subprocess.run(reverse[:3] + ["--check"] + reverse[3:], cwd=temporary, capture_output=True)
            if check.returncode == 0:
                subprocess.run(reverse, cwd=temporary, check=True, capture_output=True)
                originals = {file: (Path(temporary) / file).read_text() for file in paths}
            elif subprocess.run(["git", "apply", "--check", str(destination)], cwd=temporary, capture_output=True).returncode != 0:
                raise RuntimeError("Installed source differs from saved patch: " + name)
    changed = dict(originals)
    gradle = originals[gradle_file].replace("proguard-android.txt", "proguard-android-optimize.txt")
    if name in ["@nozbe/watermelondb", "react-native-notifications"]:
        if not re.search(r"buildConfig\s+(?:true|=\s*true)", gradle):
            gradle = re.sub(r"android\s*\{", "android {\n    buildFeatures { buildConfig true }", gradle, count=1)
    if not re.search(r"\bnamespace\b", gradle):
        manifest = (package / gradle_file).parent / "src/main/AndroidManifest.xml"
        namespace = re.search(r'package="([^"]+)"', manifest.read_text()).group(1)
        gradle = re.sub(r"android\s*\{", 'android {\n    namespace "' + namespace + '"', gradle, count=1)
    changed[gradle_file] = gradle
    if name == "react-native-notifications":
        token = originals[token_file]
        token = token.replace("import com.facebook.react.ReactInstanceManager;", "import com.facebook.react.ReactHost;")
        token = token.replace("import com.google.firebase.messaging.FirebaseMessaging;", "import com.google.firebase.messaging.FirebaseMessaging;\nimport com.google.firebase.FirebaseApp;")
        token = token.replace("    protected void refreshToken() {", "    protected void refreshToken() {\n        // Local notifications can be used before Firebase is configured.\n        if (FirebaseApp.getApps(mAppContext).isEmpty()) return;")
        start = token.index("        final ReactInstanceManager instanceManager =")
        end = token.index("        // Note: Cannot assume", start)
        token = token[:start] + """        final ReactApplication application = (ReactApplication) mAppContext;
        final ReactHost host = application.getReactHost();
        ReactContext reactContext = host != null
            ? host.getCurrentReactContext()
            : application.getReactNativeHost().getReactInstanceManager().getCurrentReactContext();
""" + token[end:]
        changed[token_file] = token
    chunks = []
    for file in paths:
        if originals[file] != changed[file]:
            chunks.append("diff --git a/" + file + " b/" + file + "\n")
            chunks.extend(difflib.unified_diff(originals[file].splitlines(True), changed[file].splitlines(True), fromfile="a/" + file, tofile="b/" + file))
    if not chunks:
        raise RuntimeError("No patch needed; review upgrade: " + name)
    destination.write_text("".join(chunks))
    entries.append("  '" + name + "@" + version + "': " + relative)
workspace = root / "pnpm-workspace.yaml"
header = workspace.read_text().split("# starter native compatibility")[0].rstrip()
workspace.write_text(header + "\n# starter native compatibility\nallowUnusedPatches: true\npatchedDependencies:\n" + "\n".join(entries) + "\n")
print("Prepared " + str(len(entries)) + " native patches")
