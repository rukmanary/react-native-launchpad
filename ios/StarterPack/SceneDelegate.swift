import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import UIKit
import RNBootSplash
// starter:module google
#if canImport(GoogleSignIn)
import GoogleSignIn
#endif
// starter:end-module
// starter:module location
#if canImport(GoogleMaps)
import GoogleMaps
#endif
// starter:end-module

class SceneDelegate: RCTDefaultReactNativeFactoryDelegate, UIWindowSceneDelegate {
  var window: UIWindow?
  var reactNativeFactory: RCTReactNativeFactory?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else {
      return
    }

    // starter:module location
    #if canImport(GoogleMaps)
    if let key = Bundle.main.object(forInfoDictionaryKey: "GoogleMapsApiKey") as? String, !key.isEmpty { GMSServices.provideAPIKey(key) }
    #endif
    // starter:end-module
    dependencyProvider = RCTAppDependencyProvider()
    reactNativeFactory = RCTReactNativeFactory(delegate: self)
    window = UIWindow(windowScene: windowScene)
    
    #if DEBUG
    let devMenuConfiguration = RCTDevMenuConfiguration(
      devMenuEnabled: true,
      shakeGestureEnabled: true,
      keyboardShortcutsEnabled: true
    )
    reactNativeFactory?.devMenuConfiguration = devMenuConfiguration
    #endif
    
    reactNativeFactory?.startReactNative(
      withModuleName: "StarterPack",
      in: window,
      connectionOptions: connectionOptions
    )

   
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    // starter:module google
    #if canImport(GoogleSignIn)
    let unhandled = Set(URLContexts.filter { !GIDSignIn.sharedInstance.handle($0.url) })
    if unhandled != URLContexts {
      RCTLinkingManager.scene(scene, openURLContexts: unhandled)
      return
    }
    #endif
    // starter:end-module
    RCTLinkingManager.scene(scene, openURLContexts: URLContexts)
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    RCTLinkingManager.scene(scene, continue: userActivity)
  }

  override func customize(_ rootView: RCTRootView) {
    super.customize(rootView)
    RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)
  }

  override func bundleURL() -> URL? {
    #if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}
