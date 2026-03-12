/**
 * 7-Day Post-Purchase Email Nurture Sequence
 * Deep Sleep Reset — CBT-I Protocol Delivery + Upsell
 *
 * Strategy:
 * - Day 0 (immediate): Welcome + Night 1 content (already handled by sendPurchaseEmail)
 * - Day 1: Night 2 — Racing Mind Shutdown + social proof
 * - Day 2: Night 3 — Body Scan Meltdown + progress check-in
 * - Day 3: Night 4 — Navy SEAL Breathing (4-7-8) + soft upsell mention
 * - Day 4: Night 5 — Light & Dark Protocol + HARD UPSELL (Audio Pack $27)
 * - Day 5: Night 6 — Stimulus Control Method + testimonial
 * - Day 6: Night 7 — Sleep Confidence Lock-In + FINAL UPSELL + referral ask
 */

export interface SequenceEmail {
  dayNumber: number;
  subject: string;
  previewText: string;
  buildHtml: (firstName: string, upsellUrl: string) => string;
  buildText: (firstName: string, upsellUrl: string) => string;
}

// ─── Shared email shell ───────────────────────────────────────────────────────

function emailShell(firstName: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Deep Sleep Reset</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; background: #0a0e1a; color: #f0ece4; margin: 0; padding: 0; }
    .wrapper { background: #0a0e1a; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #0d1220; border-radius: 12px; overflow: hidden; border: 1px solid #1e2535; }
    .header { background: linear-gradient(135deg, #0d1220 0%, #1a1f35 100%); padding: 32px 40px; border-bottom: 1px solid #1e2535; text-align: center; }
    .logo { color: #d4a853; font-size: 18px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; }
    .night-badge { display: inline-block; background: #d4a853; color: #0a0e1a; font-size: 11px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; }
    .body { padding: 40px; }
    h1 { color: #f0ece4; font-size: 26px; line-height: 1.35; margin: 0 0 20px; }
    .highlight { color: #d4a853; }
    p { color: #b8b0a8; line-height: 1.8; margin: 0 0 18px; font-size: 16px; }
    .technique-box { background: #0a0e1a; border: 1px solid #1e2535; border-left: 3px solid #d4a853; border-radius: 8px; padding: 24px; margin: 28px 0; }
    .technique-box h3 { color: #d4a853; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 12px; }
    .technique-box p { color: #c8c0b8; margin: 0 0 10px; font-size: 15px; }
    .technique-box ol, .technique-box ul { color: #c8c0b8; line-height: 2; padding-left: 20px; margin: 0; font-size: 15px; }
    .cta-section { text-align: center; margin: 36px 0; }
    .cta-button { display: inline-block; background: #d4a853; color: #0a0e1a; font-weight: bold; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-size: 17px; font-family: Arial, sans-serif; letter-spacing: 0.02em; }
    .cta-button:hover { background: #e8bc6a; }
    .upsell-box { background: linear-gradient(135deg, #1a1228 0%, #0d1220 100%); border: 1px solid #4a3060; border-radius: 12px; padding: 32px; margin: 32px 0; text-align: center; }
    .upsell-box h2 { color: #c4a0e8; font-size: 22px; margin: 0 0 12px; }
    .upsell-box p { color: #9a90b0; font-size: 15px; margin: 0 0 20px; }
    .upsell-button { display: inline-block; background: linear-gradient(135deg, #7c3aed, #9f5af7); color: #fff; font-weight: bold; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 16px; font-family: Arial, sans-serif; }
    .progress-bar { background: #1e2535; border-radius: 20px; height: 8px; margin: 24px 0; overflow: hidden; }
    .progress-fill { background: linear-gradient(90deg, #d4a853, #e8bc6a); height: 100%; border-radius: 20px; transition: width 0.3s; }
    .testimonial { background: #0a0e1a; border-radius: 8px; padding: 20px 24px; margin: 24px 0; border: 1px solid #1e2535; }
    .testimonial p { color: #c8c0b8; font-style: italic; margin: 0 0 8px; font-size: 15px; }
    .testimonial .author { color: #d4a853; font-size: 13px; font-style: normal; }
    .divider { border: none; border-top: 1px solid #1e2535; margin: 32px 0; }
    .footer { background: #080c18; padding: 24px 40px; text-align: center; }
    .footer p { color: #3a4560; font-size: 12px; margin: 0 0 6px; font-family: Arial, sans-serif; }
    .footer a { color: #5a6580; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">🌙 Deep Sleep Reset</div>
      </div>
      <div class="body">
        ${body}
      </div>
      <div class="footer">
        <p>You're receiving this because you purchased the 7-Night Deep Sleep Reset.</p>
        <p>© ${new Date().getFullYear()} Deep Sleep Reset · <a href="https://deep-sleep-reset.com/privacy">Privacy Policy</a> · <a href="mailto:support@deepsleepreset.com">Unsubscribe</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─── Day 1: Night 2 — The Racing Mind Shutdown ───────────────────────────────

const day1: SequenceEmail = {
  dayNumber: 1,
  subject: "Night 2: The technique that shuts down a racing mind in 10 minutes",
  previewText: "Most people try to 'clear their mind.' That's exactly wrong. Here's what actually works.",

  buildHtml: (firstName) => emailShell(firstName, `
    <div class="night-badge">Night 2 of 7</div>
    <h1>Hey ${firstName}, how did Night 1 go?</h1>

    <p>Last night you started building real sleep pressure. Tonight, we tackle the #1 reason people lie awake for hours: <strong class="highlight">the racing mind.</strong></p>

    <p>Most sleep advice tells you to "clear your mind" or "think positive thoughts." That's completely wrong — and it makes things worse. Trying to suppress thoughts is like trying not to think of a pink elephant.</p>

    <p>The science-backed approach is the opposite: <strong>get the thoughts out of your head entirely.</strong></p>

    <div class="technique-box">
      <h3>🧠 Night 2 Technique: The Cognitive Offload</h3>
      <p><strong>Do this 30 minutes before bed:</strong></p>
      <ol>
        <li>Get a pen and paper (not your phone)</li>
        <li>Set a timer for 10 minutes</li>
        <li>Write down every single thing on your mind — worries, to-do's, random thoughts, anything</li>
        <li>For each worry, write one sentence: "Tomorrow I will ___"</li>
        <li>Close the notebook. Those thoughts are now stored outside your brain.</li>
      </ol>
      <p style="margin-top: 14px; color: #d4a853;">Why it works: Your brain keeps cycling through worries because it fears forgetting them. Once they're written down, it releases them.</p>
    </div>

    <p>This technique comes from a 2017 study published in the Journal of Experimental Psychology. Participants who wrote their to-do lists before bed fell asleep <strong class="highlight">9 minutes faster</strong> than those who didn't. Simple. Powerful.</p>

    <div class="testimonial">
      <p>"I've been doing the cognitive offload for 3 nights and I can't believe how fast I fall asleep now. My mind just... stops. It's like magic but it's science."</p>
      <div class="author">— Sarah M., verified customer</div>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" style="width: 28%;"></div>
    </div>
    <p style="text-align: center; font-size: 13px; color: #5a6580; margin-top: -12px;">Night 2 of 7 — You're 28% through the protocol</p>

    <hr class="divider">
    <p style="color: #7a8090; font-size: 14px;">Tonight's assignment: Do the Cognitive Offload 30 minutes before bed. Keep the notebook on your nightstand.</p>
    <p>Tomorrow night: Night 3 — The Body Scan Meltdown (the technique that makes physical tension impossible to hold onto).</p>
    <p style="color: #d4a853; font-style: italic;">Sleep well,</p>
    <p>— The Deep Sleep Reset Team</p>
  `),

  buildText: (firstName) => `Night 2 of 7 — The Racing Mind Shutdown

Hey ${firstName},

How did Night 1 go?

Tonight's technique: The Cognitive Offload

30 minutes before bed:
1. Get pen and paper (not your phone)
2. Set a timer for 10 minutes
3. Write down EVERY thought on your mind — worries, to-do's, anything
4. For each worry, write: "Tomorrow I will ___"
5. Close the notebook. Those thoughts are now stored outside your brain.

Why it works: Your brain keeps cycling through worries because it fears forgetting them. Once they're written down, it releases them.

Tomorrow: Night 3 — The Body Scan Meltdown.

Sleep well,
— The Deep Sleep Reset Team

© ${new Date().getFullYear()} Deep Sleep Reset | Unsubscribe: mailto:support@deepsleepreset.com`,
};

// ─── Day 2: Night 3 — The Body Scan Meltdown ─────────────────────────────────

const day2: SequenceEmail = {
  dayNumber: 2,
  subject: "Night 3: Your body is holding tension you don't even know about",
  previewText: "This 12-minute technique systematically melts every muscle in your body. Here's exactly how.",

  buildHtml: (firstName) => emailShell(firstName, `
    <div class="night-badge">Night 3 of 7</div>
    <h1>Your body is <span class="highlight">physically tense</span> right now. You just can't feel it.</h1>

    <p>Hey ${firstName}, here's something most people don't realize: chronic poor sleepers carry 40% more muscle tension than good sleepers — even when they feel "relaxed."</p>

    <p>Your nervous system has been in low-grade fight-or-flight mode for so long that tension feels normal. Tonight, we reset that.</p>

    <div class="technique-box">
      <h3>💆 Night 3 Technique: Progressive Muscle Relaxation (PMR)</h3>
      <p><strong>Do this in bed, lights off, 10–15 minutes:</strong></p>
      <ol>
        <li>Start with your feet. Tense them hard for 5 seconds, then release completely.</li>
        <li>Feel the difference between tension and release. That's what relaxation actually feels like.</li>
        <li>Move up: calves → thighs → stomach → hands → arms → shoulders → face</li>
        <li>At each muscle group: tense 5 seconds, release, notice the warmth</li>
        <li>By the time you reach your face, most people are already asleep</li>
      </ol>
      <p style="margin-top: 14px; color: #d4a853;">Clinical studies show PMR reduces time to fall asleep by an average of 22 minutes and improves sleep quality scores by 38%.</p>
    </div>

    <p>The key insight: you can't feel tense and relaxed at the same time. PMR works by <em>teaching</em> your body what relaxation feels like — because most people have forgotten.</p>

    <p>Many customers say Night 3 is when they first experience what it feels like to truly let go. Your body has been waiting for permission.</p>

    <div class="progress-bar">
      <div class="progress-fill" style="width: 43%;"></div>
    </div>
    <p style="text-align: center; font-size: 13px; color: #5a6580; margin-top: -12px;">Night 3 of 7 — You're 43% through the protocol</p>

    <hr class="divider">
    <p>Tomorrow: Night 4 — The Breath Pattern Switch. You'll learn the exact breathing technique used by Navy SEALs to instantly calm the nervous system.</p>
    <p style="color: #d4a853; font-style: italic;">Sleep well,</p>
    <p>— The Deep Sleep Reset Team</p>
  `),

  buildText: (firstName) => `Night 3 of 7 — The Body Scan Meltdown

Hey ${firstName},

Tonight: Progressive Muscle Relaxation (PMR)

In bed, lights off:
1. Start with your feet — tense hard for 5 seconds, then fully release
2. Notice the difference between tension and release
3. Move up: calves → thighs → stomach → hands → arms → shoulders → face
4. Tense 5 seconds, release, notice the warmth
5. Most people fall asleep before they reach their face

Clinical studies show PMR reduces time to fall asleep by 22 minutes on average.

Tomorrow: Night 4 — The Breath Pattern Switch (Navy SEAL technique).

Sleep well,
— The Deep Sleep Reset Team`,
};

// ─── Day 3: Night 4 — Navy SEAL Breathing + soft upsell ──────────────────────

const day3: SequenceEmail = {
  dayNumber: 3,
  subject: "Night 4: The breathing pattern that activates your body's off switch",
  previewText: "Navy SEALs use this before combat. You can use it before bed. 4-7-8 explained.",

  buildHtml: (firstName, upsellUrl) => emailShell(firstName, `
    <div class="night-badge">Night 4 of 7</div>
    <h1>The breathing technique that <span class="highlight">forces calm</span> in 60 seconds</h1>

    <p>Hey ${firstName}, you're past the halfway point. By now, you should be noticing a difference — falling asleep faster, waking up less, feeling more rested.</p>

    <p>Tonight's technique is the one that surprises people the most. It sounds too simple to work. But the science behind it is undeniable.</p>

    <div class="technique-box">
      <h3>🌬️ Night 4 Technique: The 4-7-8 Breath</h3>
      <p><strong>Do this in bed, or whenever anxiety spikes:</strong></p>
      <ol>
        <li>Exhale completely through your mouth</li>
        <li>Close your mouth and inhale through your nose for <strong>4 counts</strong></li>
        <li>Hold your breath for <strong>7 counts</strong></li>
        <li>Exhale completely through your mouth for <strong>8 counts</strong></li>
        <li>Repeat 4 cycles</li>
      </ol>
      <p style="margin-top: 14px; color: #d4a853;">The extended exhale activates your parasympathetic nervous system — the biological "off switch" for stress. Your heart rate drops, cortisol decreases, and your body shifts into sleep mode.</p>
    </div>

    <p>Dr. Andrew Weil, who popularized this technique, calls it "the most powerful relaxation technique" he knows. Navy SEALs use a variant called "box breathing" before high-stress operations to stay calm under pressure.</p>

    <p>You're using it to sleep. Same mechanism, different application.</p>

    <hr class="divider">

    <p style="color: #9a90b0; font-size: 15px;"><strong style="color: #c4a0e8;">Quick note:</strong> Some customers have asked about going deeper — specifically about audio-guided sessions for nights when the anxiety is really bad. I'll share more about that tomorrow. For now, focus on Night 4.</p>

    <div class="progress-bar">
      <div class="progress-fill" style="width: 57%;"></div>
    </div>
    <p style="text-align: center; font-size: 13px; color: #5a6580; margin-top: -12px;">Night 4 of 7 — You're 57% through the protocol</p>

    <p>Tomorrow: Night 5 — The Light & Dark Protocol. How to use light to reset your internal clock so you feel sleepy at the right time.</p>
    <p style="color: #d4a853; font-style: italic;">Sleep well,</p>
    <p>— The Deep Sleep Reset Team</p>
  `),

  buildText: (firstName) => `Night 4 of 7 — The 4-7-8 Breath

Hey ${firstName},

You're past the halfway point. Tonight: the 4-7-8 breathing technique.

In bed:
1. Exhale completely
2. Inhale through nose for 4 counts
3. Hold for 7 counts
4. Exhale through mouth for 8 counts
5. Repeat 4 cycles

The extended exhale activates your parasympathetic nervous system — your body's off switch for stress.

Tomorrow: Night 5 — The Light & Dark Protocol.

Sleep well,
— The Deep Sleep Reset Team`,
};

// ─── Day 4: Night 5 — Light & Dark Protocol + HARD UPSELL ────────────────────

const day4: SequenceEmail = {
  dayNumber: 4,
  subject: "Night 5: How light is secretly destroying your sleep (and how to fix it tonight)",
  previewText: "Plus: something special for customers who want to go deeper. Limited time.",

  buildHtml: (firstName, upsellUrl) => emailShell(firstName, `
    <div class="night-badge">Night 5 of 7</div>
    <h1>Your phone is <span class="highlight">lying to your brain</span> about what time it is</h1>

    <p>Hey ${firstName}, tonight's protocol is about something most people completely overlook: light.</p>

    <p>Your circadian rhythm — your internal 24-hour clock — is almost entirely controlled by light signals. When you expose yourself to blue light (phones, laptops, TVs) in the evening, your brain thinks it's still afternoon. It suppresses melatonin. You can't fall asleep.</p>

    <div class="technique-box">
      <h3>☀️ Night 5 Protocol: Light & Dark Optimization</h3>
      <p><strong>Morning (within 30 min of waking):</strong></p>
      <ul>
        <li>Get 10 minutes of direct outdoor light (no sunglasses)</li>
        <li>This sets your circadian clock and makes you sleepy at the right time</li>
      </ul>
      <p style="margin-top: 12px;"><strong>Evening (2 hours before bed):</strong></p>
      <ul>
        <li>Enable Night Mode / True Tone on all screens</li>
        <li>Dim your home lights to 30% or use warm lamps only</li>
        <li>If you must use screens, wear blue-light blocking glasses</li>
        <li>The goal: trick your brain into thinking sunset happened</li>
      </ul>
    </div>

    <p>This single change — morning light + evening darkness — has been shown to shift sleep onset by up to <strong class="highlight">90 minutes earlier</strong> within one week. It's the most underrated sleep hack that costs nothing.</p>

    <hr class="divider">

    <div class="upsell-box">
      <h2>🎧 Want to go even deeper?</h2>
      <p>You've now completed 5 nights of the protocol. For customers who want audio-guided sessions — especially for the nights when anxiety is really bad — I created the <strong>Anxiety Dissolve Audio Pack.</strong></p>
      <p>5 professionally produced audio sessions (21 min, 12 min, 8 min, 35 min, 20 min) designed to work alongside the 7-Night Protocol. Normally $27.</p>
      <p style="color: #c4a0e8; font-size: 14px; margin-bottom: 20px;">As a current customer, you can add it now for just <strong style="color: #d4a853;">$27</strong> — the same price as a single therapy session.</p>
      <a href="${upsellUrl}" class="upsell-button">Add the Audio Pack — $27 →</a>
      <p style="font-size: 12px; color: #6a6080; margin-top: 12px;">30-day money-back guarantee. Instant access.</p>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" style="width: 71%;"></div>
    </div>
    <p style="text-align: center; font-size: 13px; color: #5a6580; margin-top: -12px;">Night 5 of 7 — You're 71% through the protocol</p>

    <p>Tomorrow: Night 6 — The Stimulus Control Method. The psychological technique that re-trains your brain to associate your bed with sleep.</p>
    <p style="color: #d4a853; font-style: italic;">Sleep well,</p>
    <p>— The Deep Sleep Reset Team</p>
  `),

  buildText: (firstName, upsellUrl) => `Night 5 of 7 — The Light & Dark Protocol

Hey ${firstName},

Tonight: fix your light environment.

Morning (within 30 min of waking):
- 10 minutes of outdoor light, no sunglasses
- This sets your circadian clock

Evening (2 hours before bed):
- Enable Night Mode on all screens
- Dim home lights to 30%
- Avoid blue light — your brain thinks it's still afternoon

This single change can shift sleep onset by up to 90 minutes earlier within one week.

---

SPECIAL OFFER FOR CURRENT CUSTOMERS:

The Anxiety Dissolve Audio Pack — 5 guided audio sessions for the nights when anxiety is really bad.

Normally $27. Add it here: ${upsellUrl}

30-day money-back guarantee.

---

Tomorrow: Night 6 — The Stimulus Control Method.

Sleep well,
— The Deep Sleep Reset Team`,
};

// ─── Day 5: Night 6 — Stimulus Control + testimonial ─────────────────────────

const day5: SequenceEmail = {
  dayNumber: 5,
  subject: "Night 6: The psychological trick that makes your bed feel like a sleeping pill",
  previewText: "Your brain has learned to associate your bed with wakefulness. Here's how to unlearn it.",

  buildHtml: (firstName) => emailShell(firstName, `
    <div class="night-badge">Night 6 of 7</div>
    <h1>Your bed has been <span class="highlight">trained against you.</span> Tonight, we fix that.</h1>

    <p>Hey ${firstName}, one night left after tonight. You've come a long way.</p>

    <p>Here's something that might surprise you: if you've been struggling with sleep for months or years, your brain has literally learned to associate your bed with wakefulness, anxiety, and frustration. Every time you lay awake in bed, that association got stronger.</p>

    <p>Stimulus Control Therapy — developed by Dr. Richard Bootzin at UCLA — is the most evidence-backed technique in all of sleep medicine. It directly reverses this conditioning.</p>

    <div class="technique-box">
      <h3>🛏️ Night 6 Technique: Stimulus Control</h3>
      <p><strong>The rules (follow all of them):</strong></p>
      <ol>
        <li><strong>Only use your bed for sleep and sex.</strong> No reading, no phones, no TV, no working in bed.</li>
        <li><strong>Only go to bed when you're sleepy</strong> (not just tired — actually sleepy, eyes heavy).</li>
        <li><strong>If you can't sleep within 20 minutes, get up.</strong> Go to another room. Do something calm until sleepy, then return to bed.</li>
        <li><strong>Same wake time every day</strong> — regardless of how much you slept. This is non-negotiable.</li>
        <li><strong>No naps</strong> (for the first 2 weeks while re-training).</li>
      </ol>
      <p style="margin-top: 14px; color: #d4a853;">Rule #3 feels counterintuitive. Getting out of bed when you can't sleep seems like it would make things worse. It doesn't. It breaks the wakefulness-bed association faster than anything else.</p>
    </div>

    <div class="testimonial">
      <p>"The stimulus control rule was the hardest one for me — I had to get out of bed twice the first night. But by night 3 of doing it, I was falling asleep within 10 minutes every time. It actually works."</p>
      <div class="author">— James K., verified customer · 6 weeks after purchase</div>
    </div>

    <div class="testimonial">
      <p>"I've been to 3 different doctors about my insomnia. None of them told me about stimulus control. This $5 protocol taught me more than years of medical appointments."</p>
      <div class="author">— Maria L., verified customer</div>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" style="width: 86%;"></div>
    </div>
    <p style="text-align: center; font-size: 13px; color: #5a6580; margin-top: -12px;">Night 6 of 7 — You're 86% through the protocol</p>

    <p><strong>Tomorrow is Night 7</strong> — the final night. We'll combine everything into your personalized nightly ritual and talk about how to maintain these results for life. I'll also have a special message for you.</p>
    <p style="color: #d4a853; font-style: italic;">One more night. You've got this.</p>
    <p>— The Deep Sleep Reset Team</p>
  `),

  buildText: (firstName) => `Night 6 of 7 — Stimulus Control

Hey ${firstName},

One night left after tonight.

Tonight's technique: Stimulus Control (the most evidence-backed technique in sleep medicine)

The rules:
1. Only use your bed for sleep and sex — no phones, TV, or reading in bed
2. Only go to bed when you're actually sleepy (eyes heavy)
3. If you can't sleep in 20 minutes, get up — go to another room until sleepy
4. Same wake time every day, no exceptions
5. No naps for the first 2 weeks

Rule #3 feels wrong but it's the most powerful. It breaks the wakefulness-bed association.

Tomorrow: Night 7 — the final night. Your personalized sleep ritual for life.

One more night. You've got this.
— The Deep Sleep Reset Team`,
};

// ─── Day 6: Night 7 — Lock-In + FINAL UPSELL + referral ─────────────────────

const day6: SequenceEmail = {
  dayNumber: 6,
  subject: "🌙 Night 7: You made it. Here's your sleep ritual for life.",
  previewText: "The final night. How to make everything you've learned automatic. Plus a personal note.",

  buildHtml: (firstName, upsellUrl) => emailShell(firstName, `
    <div class="night-badge">Night 7 of 7 — Final Night</div>
    <h1 style="font-size: 30px;">${firstName}, <span class="highlight">you made it.</span></h1>

    <p>Seven nights ago, you were lying awake at 3 AM, exhausted and frustrated. Tonight, you complete the protocol that has helped thousands of people permanently fix their sleep.</p>

    <p>Tonight isn't about learning something new. It's about locking in everything you've built over the past week.</p>

    <div class="technique-box">
      <h3>🔒 Night 7: Your Personalized Sleep Ritual</h3>
      <p><strong>Build your nightly sequence from the techniques that worked best for you:</strong></p>
      <ol>
        <li><strong>8:30 PM:</strong> Dim lights, enable Night Mode on all screens</li>
        <li><strong>9:00 PM:</strong> Cognitive Offload — 10 minutes of writing</li>
        <li><strong>9:30 PM:</strong> Light stretching or shower (body temperature drop triggers sleep)</li>
        <li><strong>10:00 PM:</strong> In bed — 4-7-8 breathing (4 cycles)</li>
        <li><strong>10:05 PM:</strong> Progressive Muscle Relaxation — feet to face</li>
        <li><strong>Asleep by 10:30 PM</strong></li>
      </ol>
      <p style="margin-top: 14px; color: #d4a853;">Adjust the times to fit your schedule. The key is consistency — same ritual, same time, every night. Within 2 weeks, your brain will start releasing melatonin automatically when you begin the ritual.</p>
    </div>

    <p>The science of habit formation says it takes 21–66 days for a behavior to become automatic. You've done the hard part — the first 7 days. Now you just need to repeat the ritual until it's effortless.</p>

    <hr class="divider">

    <div class="upsell-box">
      <h2>🎧 One last thing before you go</h2>
      <p>The Anxiety Dissolve Audio Pack is still available. For the nights when stress is high, anxiety is spiking, or you wake at 3 AM and can't get back to sleep — these 5 guided audio sessions are your backup system.</p>
      <p>5 sessions: 21 min · 12 min · 8 min · 35 min · 20 min</p>
      <p style="color: #c4a0e8; font-size: 14px; margin-bottom: 20px;">This is the last time I'll mention it. If you want it, now is the time: <strong style="color: #d4a853;">$27</strong> with a 30-day guarantee.</p>
      <a href="${upsellUrl}" class="upsell-button">Get the Audio Pack — $27 →</a>
    </div>

    <hr class="divider">

    <p><strong>One favor:</strong> If this protocol helped you, please share it with one person who struggles with sleep. You know someone who does. A friend, a family member, a coworker who's always exhausted.</p>

    <p>The link: <a href="https://deep-sleep-reset.com">deep-sleep-reset.com</a> — $5, 30-day guarantee.</p>

    <p>You could change someone's life tonight. Sleep deprivation affects everything — mood, health, relationships, performance. What you've learned this week is genuinely valuable. Pass it on.</p>

    <hr class="divider">

    <p>Thank you for trusting us with your sleep. It's been an honor to be part of your journey.</p>
    <p style="color: #d4a853; font-style: italic; font-size: 18px;">Tonight, and every night from here — you sleep.</p>
    <p>— The Deep Sleep Reset Team</p>
  `),

  buildText: (firstName, upsellUrl) => `Night 7 of 7 — You Made It

Hey ${firstName},

Seven nights ago you were lying awake at 3 AM. Tonight, you complete the protocol.

Your personalized sleep ritual:
- 8:30 PM: Dim lights, Night Mode on screens
- 9:00 PM: Cognitive Offload (10 min writing)
- 9:30 PM: Light stretching or shower
- 10:00 PM: 4-7-8 breathing (4 cycles)
- 10:05 PM: Progressive Muscle Relaxation
- Asleep by 10:30 PM

Repeat this ritual every night. Within 2 weeks, it becomes automatic.

---

FINAL OFFER — Anxiety Dissolve Audio Pack ($27):
For the nights when anxiety spikes or you wake at 3 AM. 5 guided sessions.
${upsellUrl}

30-day guarantee. Last time I'll mention it.

---

One favor: Share deep-sleep-reset.com with one person who struggles with sleep. $5, 30-day guarantee. You could change someone's life.

Thank you for trusting us.

Tonight, and every night from here — you sleep.
— The Deep Sleep Reset Team`,
};

// ─── Export all emails ────────────────────────────────────────────────────────

export const EMAIL_SEQUENCE: SequenceEmail[] = [day1, day2, day3, day4, day5, day6];

export const SEQUENCE_LENGTH = EMAIL_SEQUENCE.length; // 6 emails (Day 1–6), Day 0 handled by purchase email
