import UIKit
#if canImport(RNNotifications)
import RNNotifications
#endif
#if canImport(FirebaseCore)
import FirebaseCore
#endif

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    #if canImport(FirebaseCore)
    if Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil { FirebaseApp.configure() }
    #endif
    #if canImport(RNNotifications)
    RNNotifications.startMonitorNotifications()
    #endif
    return true
  }
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
}
