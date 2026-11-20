import UIKit
// starter:module notifications
#if canImport(RNNotifications)
import RNNotifications
#endif
// starter:end-module
// starter:module firebase
#if canImport(FirebaseCore)
import FirebaseCore
#endif
// starter:end-module

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // starter:module firebase
    #if canImport(FirebaseCore)
    if Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil { FirebaseApp.configure() }
    #endif
    // starter:end-module
    // starter:module notifications
    #if canImport(RNNotifications)
    RNNotifications.startMonitorNotifications()
    #endif
    // starter:end-module
    return true
  }
  // starter:module notifications
  func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    #if canImport(RNNotifications)
    RNNotifications.didRegisterForRemoteNotifications(withDeviceToken: deviceToken)
    #endif
  }
  func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    #if canImport(RNNotifications)
    RNNotifications.didFailToRegisterForRemoteNotificationsWithError(error)
    #endif
  }
  // starter:end-module
}
