The hero section text ("Earn Up To $13.75 Per Sale") is invisible in the screenshot.
The stats bar and section titles are barely visible.
The issue seems to be that the hero section uses motion.div with initial opacity:0 and the animation isn't triggering.
The hero section does NOT use FadeIn wrapper - it uses direct motion.div.
The hero motion.div has animate={{ opacity: 1, y: 0 }} which should work immediately.
Possible issue: the StarField component at z-0 might be creating a stacking context that covers content.
Or the text color classes are not resolving properly on this page.
Need to check if the hero text is actually there but just very low contrast.
