import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// ─── Mock Transcripts ─────────────────────────────────────────────────────────
// 12 sessions with varied quality across the 3-Point Quality Index.
// Each transcript represents a 45–55 minute Shamiri group therapy session.
// Sessions cover Growth Mindset as the core curriculum topic.
// Distributions: 4 strong sessions, 4 adequate, 2 weak, 2 risk-flagged.

const transcripts = [
  // ─────────────────────────────────────────────────────────────────────────
  // SESSION 1 — Excellent session. Scores: Content 3 / Facilitation 3 / Safety 3 / SAFE
  // ─────────────────────────────────────────────────────────────────────────
  {
    fellowName: "Sarah Mwangi",
    groupId: "G-Upendo",
    daysAgo: 3,
    transcript: `[Session begins at 3:05 PM. Seven participants aged 16–19 are seated in a circle. Fellow Sarah Mwangi opens with a check-in activity.]

Sarah: Okay everyone, karibu sana to today's session. I'm really glad you all made it. Before we dive in, let's do a quick check-in. I want everyone to say one word that describes how you're feeling right now — and there's no wrong answer. Amani, would you like to start?

Amani: Tired. I had exams today.

Sarah: Tired — that makes total sense after exams. Thank you for sharing that, Amani. How about you, Kofi?

Kofi: Okay I guess. A bit nervous.

Sarah: Nervous is valid. We're all figuring things out together here — there's nothing to worry about. Beatrice?

Beatrice: Happy! I finished my project.

Sarah: Yay, Beatrice! That's worth celebrating. Everyone give her a small clap. [Group claps warmly.] Okay, and the rest of you — Jabari, Njeri, Tendo, Lulu — one word each.

Jabari: Confused.

Njeri: Curious.

Tendo: Good.

Lulu: Stressed.

Sarah: Okay, we have tired, nervous, happy, confused, curious, good, and stressed. That's a really human mix, and I want you to know that all of those feelings are welcome here. Especially stressed and confused — those are going to connect to what we're talking about today. [Pauses.] So. Who here has ever felt like they were just not smart enough for something?

[Several hands go up slowly.]

Sarah: Almost everyone. Including me, by the way — I failed my Form Three mathematics exam twice. [Laughter from the group.] I'm serious! And for a while I genuinely believed that I was just not a "maths person." Has anyone ever felt that way — like you're just not a something person?

Jabari: I feel like I'm not a school person.

Sarah: Tell me more about that. What do you mean?

Jabari: Like, I try hard but the grades don't show it. So maybe it's just not for me.

Sarah: I really appreciate you sharing that, Jabari. That took courage. And what you've just described is something I want to talk about today — this idea that some people have ability and some people don't. That it's fixed. Does that resonate with others? Lulu?

Lulu: Yeah. My teacher told me I'm not a science person. She said it in front of the class.

Sarah: [Nods with empathy.] Ooh. How did that feel?

Lulu: Bad. I kind of believed her.

Sarah: Of course you did — when someone in authority says something like that, it lands hard. Thank you for trusting us with that. [Pause.] Okay, so today we're going to explore something called the Growth Mindset. Has anyone heard this phrase before?

Njeri: I think it means being positive?

Sarah: Good instinct — it's related to that, but it's a bit more specific and actually more powerful than just being positive. Let me explain it this way. [Draws two columns on a small whiteboard.] Fixed Mindset on this side. Growth Mindset on this side. A Fixed Mindset says: "I am either smart or I am not. My ability is set at birth, and effort can't really change it." A Growth Mindset says: "My brain can actually grow and change. When I struggle, I'm not failing — I'm building new pathways."

Kofi: Wait, like actually physically?

Sarah: Exactly, Kofi! This is the part I love. Neuroscience — brain science — has shown us that every time you practice something difficult, your neurons form new connections. Your brain is literally like a muscle. The more you challenge it, the stronger it gets. Just like if I never lifted anything heavier than a pencil, my arm muscles would stay weak. But if I start lifting, they grow. Same with your brain.

Amani: So if I keep studying even when it's hard, my brain actually changes?

Sarah: Precisely. And research by a psychologist named Carol Dweck showed that students who were taught this — that effort changes ability — actually started performing better in school. Not because they became magically smarter overnight, but because they stopped avoiding hard things. They started seeing struggle as the point, not as a sign to give up. Does this connect with anything in your own life?

Tendo: I was really bad at football at first. But I practiced every day after school for a term. Now I'm on the school team.

Sarah: That is a perfect real-life example of Growth Mindset! Tendo, you just described exactly what this looks like in action. [To the group.] Did everyone catch that? He didn't say "I'm a natural footballer." He said he was bad and he practiced. The effort came before the result. Beatrice, does this connect to your project you mentioned earlier?

Beatrice: Yeah, I kept restarting it because my first attempts were bad, but I didn't give up.

Sarah: And look — you finished it and you're happy today. That feeling right there? That's what Growth Mindset produces. [To Jabari.] Jabari, you said you try hard but don't see it in your grades. I want to ask you something — when you say you try, what does that trying look like?

Jabari: I read the notes once before the test.

Sarah: [Gently.] Okay, that's honest. And I think what this framework might offer you is a question: is there a different way of trying that your brain hasn't explored yet? Not that you're not smart — but that maybe the strategy needs to change, not the person?

Jabari: [Thinking.] That's... different from how I've been thinking about it.

Sarah: That's growth right there — just being open to thinking differently. Lulu, I want to come back to what your teacher said. What do you think about that now?

Lulu: I don't know. Maybe she was wrong?

Sarah: I think she was. Not because I know your grades, but because a brain's capacity isn't something a teacher can read from a test. Tests measure what you've learned so far, not what you're capable of. There's a huge difference. [Pauses.] Okay, I want to do a short activity. I'm going to give you each a small card. On one side, I want you to write one thing you believe you're "not good at." On the other side, I want you to write one small thing you could try differently. Just one thing. You don't have to share it if you don't want to.

[Group works quietly for 5 minutes.]

Sarah: Would anyone like to share? No pressure at all.

Njeri: I wrote that I'm not good at speaking in public. And on the other side I wrote: try speaking up once in this circle every session.

Sarah: Njeri, that is incredibly self-aware and actionable. That's a Growth Mindset move right there. [To the group.] Notice she didn't say "I'll become a public speaker by next week." She said one small step in a safe space. That's how real change works — incrementally.

[Discussion continues for another 15 minutes, with all seven participants sharing something.]

Sarah: Okay, before we close, I want to check in — what is one thing you're taking away from today? Go around the circle.

Amani: That struggling doesn't mean I'm failing.

Kofi: That my brain can actually grow if I put in the right kind of effort.

Beatrice: That finishing hard things feels good because the challenge was the point.

Jabari: That maybe I need to change my strategy, not give up on myself.

Njeri: That I can practice being brave in small ways.

Tendo: That what I did with football is actually a real thing — it has a name.

Lulu: That my teacher might have been wrong. And that I get to decide what I'm capable of.

Sarah: [Visibly moved.] These are beautiful. Honestly, this group is exceptional. For next session, I just want you to notice one moment where you catch yourself in a Fixed Mindset — maybe thinking "I can't do this" — and try to pause and ask: "Can I approach this differently?" That's the homework. No writing, just noticing. Okay? Asante sana, everyone. You did great today.

[Session ends at 4:12 PM. Duration: 67 minutes.]`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SESSION 2 — Excellent session, different fellow. Scores: Content 3 / Facilitation 3 / Safety 3 / SAFE
  // ─────────────────────────────────────────────────────────────────────────
  {
    fellowName: "James Otieno",
    groupId: "G-Amani",
    daysAgo: 5,
    transcript: `[Session begins at 10:00 AM. Eight participants, mostly Form Two students, gathered in a community centre room. Fellow James Otieno stands near a hand-drawn poster that says "Your brain can grow."]

James: Good morning, good morning! Welcome back. Last week we talked about emotions — how they're messengers. Today we're going to talk about something that might change how you see yourself as a student, as a person, as someone building their future. But first — quick check-in. On a scale of one to five, one finger is rough, five fingers is great, show me your morning. [Pauses while participants show hands.]

James: I see mostly threes and fours — solid! Two people showing two fingers — I see you, and I'm glad you came anyway. That actually takes more courage than coming in at a five.

Daniel: Why?

James: Because when you're at a two, it's easier to stay home. The fact that you're here means you're already choosing growth — even if you don't know it yet. Which actually leads us perfectly into today. [Points to the poster.] What do you think that means? Your brain can grow. Marcus?

Marcus: Like, learn new things?

James: Yes — and more specifically, that the capacity to learn is not fixed. Let me tell you about two students. [Writes on the board: "Zara" and "Kwame."] Zara gets her maths test back — a 40%. She thinks: "I'm just bad at maths. I'll never get it. There's no point trying." Kwame gets the same mark. He thinks: "Okay, 40% — which specific topics did I miss? What can I practise?" Six months later, who do you think is doing better in maths?

[Group: "Kwame!"]

James: Right. But here's the important thing — Zara and Kwame might have the exact same level of natural ability. The difference is entirely in how they think about ability. This is what psychologist Carol Dweck calls Mindset. Zara has what Dweck calls a Fixed Mindset — she believes ability is fixed at birth. Kwame has a Growth Mindset — he believes ability can be developed through effort and strategy.

Fatima: But some people are just naturally smarter, right?

James: Great question, Fatima — and you're right that people start with different strengths. But the research shows that those starting points are much less important than what you do with them over time. The brain is literally like a muscle — when you practise something difficult, neurons form new connections. The struggle you feel when something is hard? That's your brain physically changing. That discomfort is growth.

Daniel: So when my brain hurts from studying it's actually working?

James: Exactly! [Laughs.] "Brain hurts" is the best sign. When something feels too easy, you're not growing much. When it's genuinely hard and you push through anyway, that's when the real connections form. [Pause.] I want to try something. Think of something you are good at now that you were once terrible at. It could be anything — cooking, football, braiding hair, speaking English, anything.

Aisha: I was really bad at cooking rice. I burned it every time. Now I make the best rice in my family.

James: [Laughs warmly.] How did you get from burned rice to best rice?

Aisha: I watched my aunt carefully and I kept trying different amounts of water and heat.

James: You observed, you experimented, you persisted. That is Growth Mindset in practice! You didn't say "I'm not a cooking person." You said "I need a better strategy." [To the group.] Everyone, what Aisha just described is the blueprint. Observe, experiment, persist. What about you, Darius?

Darius: I was bad at English speaking. I used to be embarrassed. I practised by talking to myself in the mirror.

James: That takes real courage and creativity! You invented your own practice method. [Pauses.] Now I want to ask something harder. Where in your life right now are you in Fixed Mindset? Where are you telling yourself a story like "this is just not for me"?

[Quieter pause in the room.]

Esther: School in general. I always feel like I don't belong there.

James: Thank you for that honesty, Esther. "I don't belong there" — that's a powerful phrase. Can I ask: where did that idea come from? Did someone tell you that?

Esther: My cousin. She said some people are born for school and some are born for other things.

James: And you believed her?

Esther: She's smart, so… yeah.

James: Here's what I'd offer you: the fact that you're sitting here, engaging in this conversation, asking yourself hard questions — that is school-level thinking. You're doing philosophy right now. [Group laughs softly.] The idea that "some people are born for school" is itself a Fixed Mindset idea — and it's scientifically inaccurate. It's also, frankly, a harmful idea that gets passed down through generations because it lets systems off the hook. Does that make sense?

Esther: [Slowly.] I think so.

James: You don't have to fully believe me today. But I want to plant a question: what if that story is wrong? What would you do differently if you knew your brain could grow?

[Group continues discussing for another 20 minutes. James draws out quieter participants by name.]

James: Okay. Let's close with an intention. Not a goal — an intention. What is one thing you'll notice or try this week that reflects Growth Mindset?

[All eight participants share intentions. James affirms each one specifically.]

James: Beautiful. Every single one of those intentions is evidence of Growth Mindset in action — the willingness to try. I'll see you all next week. Asante.

[Session ends at 11:18 AM. Duration: 78 minutes.]`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SESSION 3 — Good session, minor facilitation gap. Scores: Content 3 / Facilitation 2 / Safety 3 / SAFE
  // ─────────────────────────────────────────────────────────────────────────
  {
    fellowName: "Grace Wanjiru",
    groupId: "G-Imani",
    daysAgo: 7,
    transcript: `[Session begins at 2:00 PM. Six participants in a school classroom. Fellow Grace Wanjiru has printed notes in hand.]

Grace: Good afternoon everyone. Today's topic is Growth Mindset. This is a concept from psychology that talks about how our brains can change when we put in effort. The idea was developed by Carol Dweck, a professor at Stanford University. Her research showed that students who believe their intelligence can grow actually achieve more over time. [Reads from notes.] "The view you adopt for yourself profoundly affects the way you lead your life."

Participant (Peter): What does that mean in simple words?

Grace: It means how you think about your abilities changes your actions. So if you think you can't get better at something, you won't try as hard. But if you think effort leads to improvement, you work harder. Does that make sense?

[Group nods.]

Grace: Okay. So there are two types of mindset. Fixed Mindset — where you believe your abilities are fixed — and Growth Mindset, where you believe abilities develop. [Writes on board.] In a Fixed Mindset, you avoid challenges because failure feels like proof you're not smart. In a Growth Mindset, you embrace challenges because they help you grow. Growth Mindset people look at failure differently — they see it as feedback, not as the end.

Wanjiku: I feel like I'm always in Fixed Mindset.

Grace: Okay, that's honest. Most people are, to be honest. It's the default. The brain actually prefers safety — so avoiding challenges is the path of least resistance. But we can retrain that instinct.

Grace: [Continues from notes.] The Growth Mindset also connects to the idea that the brain is like a muscle. Every time you learn something new or push through a difficulty, neurons in your brain form new connections. This is called neuroplasticity. So the physical structure of your brain literally changes based on what you practice.

Amara: So studying actually changes your brain?

Grace: Correct. The more you practice something difficult, the stronger those brain pathways become. Which is why consistency matters more than talent in the long run.

[Grace continues explaining the concept for another 10 minutes, primarily through direct explanation with occasional questions from participants. She gives a clear example about a student who improved in swimming through consistent practice. The group is engaged but somewhat passive.]

Grace: Okay, so now I want to ask — can anyone give me an example of Growth Mindset from their own life?

[Silence for about 10 seconds.]

Grace: No one? Okay, let me give another example. [Gives example.] Does that help clarify?

[Group: "Yes."]

Grace: Good. So what I want you to remember from today: your brain can change, effort leads to improvement, and challenges are opportunities to grow. Not obstacles. [Looks at notes.] I think that covers the main points. Any questions?

[No questions from the group.]

Grace: Alright. For next session, think about one area where you have a Fixed Mindset and how you might shift that. Okay? See you next week.

[Session ends at 3:10 PM. Duration: 70 minutes.]`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SESSION 4 — Good engagement, content slightly rushed. Scores: Content 2 / Facilitation 3 / Safety 3 / SAFE
  // ─────────────────────────────────────────────────────────────────────────
  {
    fellowName: "David Kamau",
    groupId: "G-Nguvu",
    daysAgo: 10,
    transcript: `[Session begins at 4:00 PM. Five participants. Fellow David Kamau is energetic and humorous.]

David: [Clapping hands.] Okay, team! Great energy today, I can feel it. Let's do this. Quick check-in — finish this sentence: "This week I surprised myself when I..." Go around.

Mercy: When I finished an assignment the day it was given, not the last minute.

David: That is character growth right there. Actual transformation happening. Next!

Brian: I surprised myself when I helped my younger brother with homework. I never do that.

David: Who knew you were a teacher? I see you, Brian. Keep going.

Harriet: I surprised myself when I spoke up in class and the teacher said my answer was really insightful.

David: Harriet! That must have felt incredible. I want you to hold onto that feeling — we're going to come back to it. [Others share.]

David: Okay. So today we're talking about Growth Mindset. The really quick version: your abilities are not fixed. They grow. Your brain literally builds new connections when you practice hard things. The term was coined by Carol Dweck and it's changed how a lot of schools and companies think about potential.

Brian: Can you explain more about the brain connection thing?

David: Yes — great question. [Explains neuroplasticity briefly.] Basically your brain is plastic — not like a bag, but like clay. It shapes itself based on what you do repeatedly. Every time you struggle through something hard, even if you don't succeed at first, you're reshaping the clay. Over time, what was hard becomes easier because you've built the pathway.

David: Now Harriet — when you spoke in class and it went well, what was the path to that moment? Was that the first time you tried?

Harriet: No. I've been pushing myself to speak up more. I kept telling myself, what's the worst that happens?

David: That self-talk you described — "what's the worst that happens?" — that's you actively combating a Fixed Mindset voice. Fixed Mindset says "don't risk it, you'll embarrass yourself." Growth Mindset says "try, learn, repeat."

[David continues with high energy, engaging the group through discussion, jokes, and personal stories. He consistently affirms participants and brings quieter members in by name. However, the actual curriculum content on Growth Mindset — defining it formally, checking understanding, and giving a structured example — is covered fairly quickly in the first 15 minutes before transitioning into general motivation and life skills conversation.]

David: I want to make sure everyone got the core idea. Growth Mindset in one sentence — who wants to try?

Mercy: It's believing that your abilities can get better through effort?

David: Perfect. Exactly. That's it. [Moves on to closing activity.]

[Session ends at 5:10 PM. Duration: 70 minutes.]`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SESSION 5 — Adequate. Both content and facilitation middle-of-road. Scores: Content 2 / Facilitation 2 / Safety 3 / SAFE
  // ─────────────────────────────────────────────────────────────────────────
  {
    fellowName: "Aisha Hassan",
    groupId: "G-Ujasiri",
    daysAgo: 14,
    transcript: `[Session begins at 9:00 AM. Five participants. Fellow Aisha Hassan opens the session by reading from prepared notes.]

Aisha: Good morning. Today we are continuing our programme. The topic for today is Growth Mindset. This is the belief that intelligence and abilities are not fixed and can be developed with effort and the right strategies. Growth Mindset was studied by Professor Carol Dweck.

[Aisha reads several paragraphs from her notes about the definition of Growth Mindset, Fixed Mindset, and the importance of effort. She reads with minimal eye contact, pausing occasionally to look up at the group.]

Aisha: So does anyone have any questions about what I've explained?

[No response from the group for several seconds.]

Aisha: Okay. [Continues reading.] One of the key ideas is that effort matters more than talent. Research shows that students who are praised for their effort rather than their intelligence perform better over time. This is because effort is something within our control while intelligence feels fixed.

Participant (Fatuma): So we shouldn't be proud of being smart?

Aisha: Not exactly. Being smart is fine. But relying only on natural ability without putting in effort is the problem. Growth Mindset says you should embrace challenges because that's how you improve.

Fatuma: Okay.

Aisha: [Continues.] Another aspect is how we respond to failure. People with a Growth Mindset see failure as a learning opportunity. People with a Fixed Mindset see failure as proof they aren't good enough. So the goal is to reframe failure.

[Session continues in this format for another 30 minutes. Aisha covers all the key concepts but primarily through one-way delivery. She occasionally asks closed questions that are answered with single words by participants. She is polite and not unkind, but the interaction is minimal.]

Aisha: Okay, I think we've covered the main content for today. Any final questions?

[Group is quiet.]

Aisha: Remember: effort over talent, embrace challenges, learn from failure. That is Growth Mindset. See you next week.

[Session ends at 10:05 AM. Duration: 65 minutes.]`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SESSION 6 — Minor protocol drift but recovers. Scores: Content 2 / Facilitation 2 / Safety 2 / SAFE
  // ─────────────────────────────────────────────────────────────────────────
  {
    fellowName: "Michael Odhiambo",
    groupId: "G-Umoja",
    daysAgo: 18,
    transcript: `[Session begins at 3:30 PM. Six participants. Fellow Michael Odhiambo starts with an icebreaker.]

Michael: Welcome back. Today we're doing Growth Mindset. Before we get into it, quick check-in — how was everyone's week?

[Participants share. One participant, Kevin, mentions a conflict with his girlfriend at length — about 8 minutes of conversation about relationship advice.]

Michael: That sounds really tough, Kevin. Have you thought about having a direct conversation with her about what you need?

Kevin: I don't know how to do that. Can you help me figure out what to say?

Michael: [Pauses.] I hear you, and I think communication in relationships is genuinely important. But I want to be honest — our session today is about Growth Mindset, and that's where I'm trained to support you. What I can say is that Growth Mindset actually connects to relationships too — being open to learning how to communicate better is Growth Mindset in action. But for the specific relationship stuff, would you be able to talk to a trusted adult or counsellor at school?

Kevin: Yeah, okay.

Michael: Great. And hold that question about communication — it's actually worth coming back to in the context of today's topic. [Transitions.] So. Growth Mindset. Who's heard of this before?

[One participant raises hand. Michael explains the concept — covering the basics of Fixed vs Growth Mindset, mentioning that abilities can develop, but without a concrete example from the participants' lives or a comprehension check. The session is somewhat hurried after the time spent on Kevin's situation.]

Michael: So basically — effort over ability, brain can grow. That's the core of it. I know we've gone a bit over on time so let's do a quick closing. One thing you're taking away?

[Participants give brief answers. Session feels slightly rushed at the end.]

Michael: Good. See you all next week.

[Session ends at 4:50 PM. Duration: 80 minutes — with significant time on off-topic discussion.]`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SESSION 7 — Weak content delivery (Fixed mindset framing used). Scores: Content 1 / Facilitation 2 / Safety 3 / SAFE
  // ─────────────────────────────────────────────────────────────────────────
  {
    fellowName: "Faith Njeri",
    groupId: "G-Pamoja",
    daysAgo: 21,
    transcript: `[Session begins at 2:15 PM. Five participants. Fellow Faith Njeri opens with energy.]

Faith: Hi everyone! Good to see you all. Today we're talking about mindset — specifically about how the way you think affects your life. I want to start by asking: do you think intelligence is something you're born with, or something you can build?

[Mixed responses from participants — some say born with, some say build.]

Faith: Interesting split! So here's the thing — scientists have studied this a lot, and the truth is, some people are naturally gifted and some people aren't. That's just how it is. But the Growth Mindset approach says that even if you're not naturally gifted, you can still develop skills through effort. So it's not hopeless if you're not the smartest person in the room.

[Pause. No participant challenges this framing.]

Faith: The idea is that you work with what you have. Some people will always find things easier — that's just talent. But the rest of us can make up for it with hard work. That's what Growth Mindset is really about, I think.

Participant (Kezia): So hard work can beat talent?

Faith: Sometimes, yes. If you work hard enough. But of course, someone with talent AND hard work will always do better. [Laughs.] So we should all just do our best with what we've got.

[The session continues with Faith covering effort and perseverance, but the underlying framing remains one where innate talent is the primary ceiling. The concept of neuroplasticity — that the brain physically changes and that anyone can grow significantly — is not mentioned. The facilitation is warm and conversational, but the content fundamentally miscommunicates Growth Mindset by retaining a Fixed Mindset foundation (intelligence is fixed at birth, effort helps you "cope" rather than genuinely transform).]

Faith: Okay, any questions? No? Good. So remember: work hard with what you have, and don't compare yourself too much to the naturally talented ones. That's the Growth Mindset message for today.

[Session ends at 3:25 PM. Duration: 70 minutes.]`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SESSION 8 — Poor facilitation. Monologue-heavy. Scores: Content 2 / Facilitation 1 / Safety 3 / SAFE
  // ─────────────────────────────────────────────────────────────────────────
  {
    fellowName: "Samuel Kipchoge",
    groupId: "G-Matumaini",
    daysAgo: 25,
    transcript: `[Session begins at 11:00 AM. Six participants. Fellow Samuel Kipchoge immediately begins a lecture-style delivery.]

Samuel: Okay, sit down everyone. Today we are doing Growth Mindset. Pay attention because there's a lot to cover. Growth Mindset is the idea that intelligence is not fixed. It was developed by Carol Dweck. The main principle is that effort leads to improvement. The brain has something called neuroplasticity which means it can form new connections through learning. This is why practice makes perfect. In a Fixed Mindset, you believe you either have talent or you don't. In a Growth Mindset, you believe that working hard changes your ability. Dweck did research on students and found that telling them about neuroplasticity improved their grades. So the lesson is: work hard, believe in improvement, and don't give up. Any questions?

[No questions from the apparently disengaged group. One participant appears to be looking at their phone. Another is yawning.]

Samuel: Good. Moving on. Another aspect of Growth Mindset is how you respond to criticism. In a Fixed Mindset, you take criticism personally because it feels like an attack on your identity. In a Growth Mindset, you take criticism as feedback for improvement. So when a teacher corrects you, don't feel bad — use it to get better. That's the mature response. [Pauses briefly.] Also, comparing yourself to others is a Fixed Mindset habit. Focus on your own progress. [Continues for several more minutes without pausing for responses.]

Participant (Linet): [Quietly] Um — can I ask something?

Samuel: [Doesn't hear.] So in conclusion, the three things to remember are: effort beats talent, embrace failure, and don't compare yourself. That's it for today. [Checks watch.] We have fifteen minutes left. Does anyone have questions?

Linet: I was trying to ask earlier — does this apply to creative things too, like art?

Samuel: Yes, same principle applies to everything. [Moves on without exploring this with her.] Okay, any other questions? No? Alright. See you next week. Remember the three points.

[Session ends at 12:05 PM. Duration: 65 minutes.]`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SESSION 9 — Adequate overall. Content okay, some facilitation warmth. Scores: Content 2 / Facilitation 2 / Safety 3 / SAFE
  // ─────────────────────────────────────────────────────────────────────────
  {
    fellowName: "Amina Osei",
    groupId: "G-Furaha",
    daysAgo: 28,
    transcript: `[Session begins at 3:00 PM. Five participants. Fellow Amina Osei opens with a question.]

Amina: Okay everyone. I want to start with a question. Has anyone here ever given up on something because it felt too hard? No judgment — I definitely have.

[Several participants nod.]

Amina: Good, because today we're talking about why that happens and what we can do about it. The topic is Growth Mindset. Basically — and I'll explain this more in a moment — it's the idea that your brain and your abilities are not fixed things. They grow. [Pauses.] The opposite is called a Fixed Mindset, where you believe you're either good at something or you're not, and there's nothing you can do about it.

Participant (Naomi): Like how some people say they're "just not a morning person"?

Amina: [Laughs.] Yes! That's a small example. And some of those things might have genetic components. But for learning and skills — school, sports, music, even social skills — the research is very clear that practice and effort actually change your brain structure. Your neurons form new connections. [Briefly explains neuroplasticity.]

Naomi: So the people who are "naturally smart" just practiced earlier?

Amina: Often, yes! Or they were encouraged to try more, or had more resources to practice with. The head start looks like talent. [Pause.] Does anyone want to share something they've improved at through effort?

[Two participants share. Third participant is quiet. Amina doesn't draw them in specifically.]

Amina: Good. [Moves on.] So the key practices for Growth Mindset are: embracing challenge, learning from criticism, finding inspiration in others' success, and believing that effort is the path to mastery. [Lists these but doesn't deeply explore any one of them with the group.] I think the most important one is believing that effort leads to mastery — because that's the belief that will keep you going when things are hard.

[Session continues. Content is generally accurate and covers the key ideas, though it moves quickly. Facilitation is warm but slightly uneven — Amina engages some participants well but misses the quieter ones.]

Amina: Okay, closing thoughts. What's one word that describes how you think about challenge now compared to before?

[Participants give words: "open", "less scared", "curious", "the same", "different".]

Amina: Good range. Even "the same" is valid — change takes time and repetition. See you all next week.

[Session ends at 4:10 PM. Duration: 70 minutes.]`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SESSION 10 — Excellent session quality, BUT contains a risk indicator (self-harm disclosure)
  // Scores: Content 3 / Facilitation 3 / Safety 3 / RISK
  // ─────────────────────────────────────────────────────────────────────────
  {
    fellowName: "Brian Muthoni",
    groupId: "G-Bidii",
    daysAgo: 2,
    transcript: `[Session begins at 1:00 PM. Seven participants. Fellow Brian Muthoni leads an engaging and warm session on Growth Mindset.]

Brian: Hey everyone, great to have you all here. Let's dive in — today we're talking about something that I genuinely believe can change your life if you take it seriously. Growth Mindset. Who's heard of it?

[A few hands. Brian explains the concept clearly and engagingly, covering Fixed vs Growth Mindset, neuroplasticity, Carol Dweck's research, and giving multiple relatable examples. He invites participants by name and validates each contribution warmly. The content delivery is excellent.]

[Approximately 35 minutes into the session, during a reflective exercise where Brian asks participants to share a time they felt like giving up:]

Zanele: [Quietly] I had a time recently where I wanted to give up on everything. Not just school. Like... everything.

Brian: [Pauses, gives full attention.] Thank you for sharing that, Zanele. Can you tell me a bit more about what you mean by everything?

Zanele: [After a long pause.] I've been having really dark thoughts lately. Like, what's the point of being here. I've been thinking about hurting myself.

Brian: [Calmly and directly.] I'm really glad you told me that, Zanele. That took a lot of courage. I want you to know that what you're feeling is serious, and you deserve proper support. I'm going to make sure you get that today — you won't leave this session without us connecting you to someone who can help. [To the group, gently.] I want to give Zanele some specific attention after our session today. Let's take a five-minute break and I'll be right back with you all. [Privately checks in with Zanele.]

[Brian handles the disclosure calmly, does not ignore it or minimise it, and arranges for Zanele to speak with the school counsellor immediately after the session. He does not attempt to provide therapy himself. He returns to the group and closes the session appropriately.]

Brian: Okay everyone — I just want to say, this is a safe space and everyone here matters. If any of you are ever feeling dark or overwhelmed, please come and talk to me or another adult you trust. That's not weakness — that's Growth Mindset applied to your mental health. Taking care of yourself is the bravest thing you can do.

[Session ends at 2:25 PM. Duration: 85 minutes.]`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SESSION 11 — Protocol violation: Fellow gives medical advice. Scores: Content 2 / Facilitation 2 / Safety 1 / RISK
  // ─────────────────────────────────────────────────────────────────────────
  {
    fellowName: "Lydia Achieng",
    groupId: "G-Subira",
    daysAgo: 6,
    transcript: `[Session begins at 10:30 AM. Six participants. Fellow Lydia Achieng opens the session.]

Lydia: Good morning everyone. Today we're talking about Growth Mindset. Basically it means your brain can grow through effort. Fixed Mindset says you're stuck with what you have; Growth Mindset says you can develop. Has anyone heard of this before?

[Brief discussion. Lydia covers the basics competently though without deep engagement.]

Participant (Omondi): I have ADHD and my doctor put me on medication, but my mum says I shouldn't take it because it changes who I am. What do you think?

Lydia: That's a really good question. Honestly, I've heard that some of those ADHD medications can be addictive and they have a lot of side effects. Some people do really well without them, especially if they work on strategies like Growth Mindset — you know, using effort and the right learning techniques. I know a few people who stopped their ADHD medication and actually performed better because they found coping strategies. Have you tried studying in shorter bursts? That can really help with focus.

Omondi: So you think I should stop taking it?

Lydia: I'm not saying definitely stop — that's a conversation to have with your family. But I do think these kinds of techniques can sometimes replace medication if you're disciplined about it. Some parents are right to be cautious about those pills.

[The session continues. Lydia returns to Growth Mindset content but the damage of providing medical opinion on ADHD medication — outside her scope as a Shamiri Fellow — has been done. She does not walk back her comments or clarify that she is not a medical professional.]

[Session ends at 11:40 AM. Duration: 70 minutes.]`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SESSION 12 — Severe: Crisis not handled, multiple violations. Scores: Content 1 / Facilitation 1 / Safety 1 / RISK
  // ─────────────────────────────────────────────────────────────────────────
  {
    fellowName: "Kevin Njoroge",
    groupId: "G-Neema",
    daysAgo: 1,
    transcript: `[Session begins at 2:00 PM. Six participants. Fellow Kevin Njoroge opens the session.]

Kevin: Hey. Okay so today we're doing some topic on mindset. [Shuffles papers.] Right, so basically there's a fixed one and a growth one. Fixed means you think you can't change. Growth means you think you can. That's the idea. [Pauses.] Okay, does everyone get that?

[Some nods. Kevin appears unprepared.]

Kevin: Cool. So, let me tell you about my experience. When I was in school, I was very depressed — like, seriously depressed for two years. I started using alcohol to cope. It wasn't great. [Laughs awkwardly.] But I got through it. The point is that mindset helped me. Once I decided I was going to change, I did. So it works.

Participant (Silas): I've also been really struggling. Like mentally. I don't sleep. I feel hopeless most of the time. Sometimes I think everyone would be better off without me.

Kevin: [Pauses.] Yeah, that's tough. I think we all go through phases like that. You know what helped me? Just deciding to change. Like I woke up one day and said, okay, I'm done feeling sorry for myself. Have you tried that?

Silas: I mean, I try. But it doesn't really work.

Kevin: You just have to push through it. Mind over matter. That's Growth Mindset — deciding your situation doesn't define you. [Moves on quickly.] Anyway, back to the topic. So effort is really important...

[Kevin continues the session, reverting to unfocused discussion about motivation. He does not follow up on Silas's disclosure of hopelessness and passive suicidal ideation. He does not inform any supervisor or school counsellor. He shares inappropriate personal disclosures about his own mental health history in ways that are not therapeutically framed. The Growth Mindset content is barely covered.]

[Session ends at 3:05 PM. Duration: 65 minutes.]`,
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ── Supervisor ──────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("Shamiri2026!", 12);
  const supervisor = await db.supervisor.upsert({
    where: { email: "supervisor@shamiri.org" },
    update: {},
    create: {
      name: "Dr. Wanjiku Kariuki",
      email: "supervisor@shamiri.org",
      password: hashedPassword,
    },
  });
  console.log(`✅ Supervisor created: ${supervisor.name} <${supervisor.email}>`);
  console.log(`   Password: Shamiri2026!\n`);

  // ── Fellows & Sessions ──────────────────────────────────────────────────
  console.log("📝 Seeding sessions...\n");

  for (const t of transcripts) {
    const fellow = await db.fellow.upsert({
      where: { id: `fellow-${t.fellowName.replaceAll(" ", "-").toLowerCase()}` },
      update: {},
      create: {
        id: `fellow-${t.fellowName.replaceAll(" ", "-").toLowerCase()}`,
        name: t.fellowName,
      },
    });

    const sessionDate = new Date();
    sessionDate.setDate(sessionDate.getDate() - t.daysAgo);

    const session = await db.session.create({
      data: {
        fellowId: fellow.id,
        groupId: t.groupId,
        date: sessionDate,
        transcript: t.transcript,
        status: "PENDING",
      },
    });

    console.log(`  ✓ Session ${session.id.slice(-6)} | ${t.fellowName} | ${t.groupId} | ${sessionDate.toDateString()}`);
  }

  console.log(`\n✅ Seeded ${transcripts.length} sessions.`);
  console.log("\n🎉 Seed complete!");
  console.log("\n─────────────────────────────────────────────");
  console.log("Login credentials:");
  console.log("  Email:    supervisor@shamiri.org");
  console.log("  Password: Shamiri2026!");
  console.log("─────────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
