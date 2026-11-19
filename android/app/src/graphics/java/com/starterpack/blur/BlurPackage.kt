package com.starterpack.blur
import android.content.Context
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManager
import com.facebook.react.uimanager.annotations.ReactProp
import eightbitlab.com.blurview.BlurTarget
import eightbitlab.com.blurview.BlurView
import java.lang.ref.WeakReference

private val targets = mutableMapOf<String, WeakReference<BlurTarget>>()
class Surface(context: Context): BlurView(context) {
    var targetKey = ""
    var radius = 16f
    fun connect() { post { targets[targetKey]?.get()?.let { target -> setupWith(target).setBlurRadius(radius.coerceIn(1f,25f)) } } }
    override fun onAttachedToWindow() { super.onAttachedToWindow(); connect() }
}
class TargetManager: ViewGroupManager<BlurTarget>() {
    override fun getName() = "StarterBlurTarget"
    override fun createViewInstance(context: ThemedReactContext) = BlurTarget(context)
    @ReactProp(name="targetKey")
    fun setTarget(view: BlurTarget, key: String) { targets[key] = WeakReference(view) }
    override fun onDropViewInstance(view: BlurTarget) {
        targets.entries.removeAll { it.value.get() == null || it.value.get() === view }
        super.onDropViewInstance(view)
    }
}
class SurfaceManager: ViewGroupManager<Surface>() {
    override fun getName() = "StarterBlurSurface"
    override fun createViewInstance(context: ThemedReactContext) = Surface(context)
    @ReactProp(name="targetKey")
    fun setTarget(view: Surface, key: String) { view.targetKey=key; view.connect() }
    @ReactProp(name="radius",defaultFloat=16f)
    fun setRadius(view: Surface, radius: Float) { view.radius=radius;view.connect() }
}
class BlurPackage: ReactPackage {
    override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = emptyList()
    override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = listOf(TargetManager(), SurfaceManager())
}

