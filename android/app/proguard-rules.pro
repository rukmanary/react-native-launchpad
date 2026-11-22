# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# starter:module location
# Maps pulls in WorkManager 2.9.1. Room and WorkManager create these classes by reflection.
-keep class androidx.work.impl.WorkDatabase_Impl { <init>(); }
-keep class androidx.work.ArrayCreatingInputMerger { <init>(); }
-keep class androidx.work.OverwritingInputMerger { <init>(); }
# starter:end-module

# starter:module ui
# Date Picker initializes the Time4J resource loader by class name.
-keep public class net.time4j.android.ApplicationStarter
-keep public class net.time4j.PrettyTime
-keep public class net.time4j.android.spi.AndroidResourceLoader { public <init>(); }
# starter:end-module

# starter:module camera
# ML Kit discovers its components through the manifest and calls public constructors by reflection.
-keep class com.google.mlkit.** implements com.google.firebase.components.ComponentRegistrar { public <init>(); }
# starter:end-module
