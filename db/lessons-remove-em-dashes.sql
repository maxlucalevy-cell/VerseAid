-- Rewrites seeded lesson/exercise copy to remove em dashes used as
-- punctuation, keeping the same meaning. Updates rows in place (keyed by
-- lesson_id + order_index) so exercise ids and user progress are preserved.
-- Run in the Supabase SQL editor. Safe to re-run.

-- ------------------------------------------------------------
-- LESSONS (only Song Structure's description contains an em dash)
-- ------------------------------------------------------------
update public.lessons
set description = $$Learn the shapes songs take: verses, choruses, bridges, and how they fit together.$$
where id = '00000000-0000-4000-8000-000000000001';

-- ------------------------------------------------------------
-- LESSON 1: Song Structure
-- ------------------------------------------------------------
update public.lesson_exercises
set feedback = $${"a":"Right. The pre-chorus's whole job is to build anticipation and lead the ear into the chorus. It's the ramp, not the destination.","b":"The bridge almost always shows up later, usually after the second chorus, to offer contrast before the song's final push, not as a lead-in to the first chorus.","c":"An outro closes a song out, so it wouldn't appear this early in the structure.","d":"A second verse comes after the first chorus, not before it. Verses typically alternate with choruses rather than stack up front."}$$::jsonb
where lesson_id = '00000000-0000-4000-8000-000000000001' and order_index = 0;

update public.lesson_exercises
set feedback = $${"match":"That's the shape. Intro sets the scene, Verse tells the story, Chorus delivers the payoff, and Bridge offers contrast before circling back. Most pop songs follow some version of this arc.","mismatch":"Close, but not quite the usual order. The most common shape is Intro then Verse then Chorus then Bridge: setup, story, payoff, then contrast. Try thinking about which section's job depends on the one before it."}$$::jsonb
where lesson_id = '00000000-0000-4000-8000-000000000001' and order_index = 1;

update public.lesson_exercises
set feedback = $${"a":"Strong choice. Here's why: by this point the listener has heard the verse-chorus pattern twice, so a bridge here lands as a real break from what they're expecting, right before the song's biggest final moment.","b":"That works too, but here's a trade-off: opening with the bridge means the listener has nothing to contrast it against yet, so its 'this is different' effect is mostly lost. It can work as a bold structural choice, but it's a harder trick to pull off."}$$::jsonb
where lesson_id = '00000000-0000-4000-8000-000000000001' and order_index = 2;

-- ------------------------------------------------------------
-- LESSON 2: Rhyme Schemes
-- ------------------------------------------------------------
update public.lesson_exercises
set feedback = $${"a":"AABB would mean the first two lines rhyme with each other and the last two rhyme with each other. But here, line 1 (day) rhymes with line 3 (way), not line 2.","b":"Right. Line 1 and 3 rhyme (day/way) and line 2 and 4 rhyme (night/light), which is exactly the alternating ABAB pattern.","c":"ABBA would mean the first and last lines rhyme with each other, with the middle two rhyming with each other. That's not what's happening here.","d":"AAAA would mean all four lines rhyme with each other, but day/way and night/light are two distinct rhyme sounds, not one."}$$::jsonb
where lesson_id = '00000000-0000-4000-8000-000000000002' and order_index = 0;

update public.lesson_exercises
set feedback = $${"a":"This one's part of the rhyming group. Flame, game, and name all share the same end sound.","b":"This one's part of the rhyming group. Flame, game, and name all share the same end sound.","c":"This one's part of the rhyming group. Flame, game, and name all share the same end sound.","d":"This is the odd one out. Friend doesn't share the -ame sound the other three have in common."}$$::jsonb
where lesson_id = '00000000-0000-4000-8000-000000000002' and order_index = 1;

update public.lesson_exercises
set feedback = $${"a":"Strong choice. Here's why: repeating one rhyme sound across every line tends to lock into memory fast, which is a big part of why some choruses feel instantly singable.","b":"That works too, but here's a trade-off: alternating rhyme sounds gives more variety and can feel less repetitive over a full song, but it usually takes an extra listen or two before people can sing along."}$$::jsonb
where lesson_id = '00000000-0000-4000-8000-000000000002' and order_index = 2;

-- ------------------------------------------------------------
-- LESSON 3: Meter & Rhythm
-- ------------------------------------------------------------
update public.lesson_exercises
set feedback = $${"a":"That's a bit low. Count each word's syllables one at a time: I, walked, a-lone, down, the, emp-ty, street.","b":"Close, but recount 'alone' (a-lone, 2 syllables) and 'empty' (emp-ty, 2 syllables). Those two two-syllable words push the total higher.","c":"Right. I(1) walked(1) a-lone(2) down(1) the(1) emp-ty(2) street(1) adds up to 9.","d":"That's a bit high. Double check each word; none of these words carry three syllables."}$$::jsonb
where lesson_id = '00000000-0000-4000-8000-000000000003' and order_index = 0;

update public.lesson_exercises
set feedback = $${"a":"This one holds the pattern: six syllables, same as the others.","b":"This one holds the pattern: six syllables, same as the others.","c":"This is the one that breaks the pattern. 'Forever' adds an extra syllable, pushing this line to seven while the others hold steady at six.","d":"This one holds the pattern: six syllables, same as the others."}$$::jsonb
where lesson_id = '00000000-0000-4000-8000-000000000003' and order_index = 1;

update public.lesson_exercises
set feedback = $${"a":"Strong choice. Here's why: short, heavily-stressed syllables landing close together can read as clipped and exhausted, like someone who barely has energy left to finish a sentence.","b":"That works too, but here's a trade-off: a longer, more flowing line can capture weariness as a drawn-out ache rather than a clipped one. It trades the 'out of energy' feeling for a 'this has been going on forever' feeling."}$$::jsonb
where lesson_id = '00000000-0000-4000-8000-000000000003' and order_index = 2;

-- ------------------------------------------------------------
-- LESSON 4: Storytelling in Lyrics
-- ------------------------------------------------------------
update public.lesson_exercises
set feedback = $${"a":"That works too, but here's a trade-off: this is broad and open, which can suit a wistful, dreamy tone, but it gives the listener very little to actually picture.","b":"Strong choice. Here's why: a specific image (sunburned shoulders, a named month) gives the listener something concrete to see, which usually makes a memory feel more real."}$$::jsonb
where lesson_id = '00000000-0000-4000-8000-000000000004' and order_index = 0;

update public.lesson_exercises
set feedback = $${"example":"I miss the smell of coffee in your kitchen at 7am.","reasoning":"There's no single right answer here. Yours doesn't need to match this example; it just needs to trade a vague, general statement for one specific sensory detail (a smell, a sound, a time of day, an object) that anchors the feeling in a real moment."}$$::jsonb
where lesson_id = '00000000-0000-4000-8000-000000000004' and order_index = 1;

update public.lesson_exercises
set feedback = $${"a":"That works too, but here's a trade-off: this tells the listener directly what happened, which is clear and efficient, but it does the emotional work for them instead of letting them feel it.","b":"Strong choice. Here's why: a small, specific detail like a kept key implies a whole relationship history (they haven't asked for it back, there's unfinished business) without a single word of direct explanation. The listener fills in the story themselves."}$$::jsonb
where lesson_id = '00000000-0000-4000-8000-000000000004' and order_index = 2;

-- ------------------------------------------------------------
-- LESSON 5: Hook-Writing
-- ------------------------------------------------------------
update public.lesson_exercises
set feedback = $${"a":"The bridge usually offers contrast from the rest of the song. It's not typically where the hook lives.","b":"Right. The chorus is built to repeat, and the hook usually lives there so it comes back around every time, cementing it in the listener's memory.","c":"Verses usually carry the story forward with new details each time, which makes them a less natural home for a repeating hook.","d":"A hook only in the outro would mean most listeners never even hear it, since not everyone listens all the way through."}$$::jsonb
where lesson_id = '00000000-0000-4000-8000-000000000005' and order_index = 0;

update public.lesson_exercises
set feedback = $${"a":"Strong choice. Here's why: it's short, rhythmically simple, and easy to belt out or sing along to on first listen. All of that helps a hook stick.","b":"That works too, but here's a trade-off: it's more specific and conversational, which can feel more real, but the length and phrasing make it much harder to repeat naturally or sing along to."}$$::jsonb
where lesson_id = '00000000-0000-4000-8000-000000000005' and order_index = 1;

update public.lesson_exercises
set
  prompt = $$Of these three hook candidates, which one is the hardest to sing along to on a first listen, and does that matter?$$,
  feedback = $${"a":"This one sits in the middle: clear and rhythmic, though not quite as instantly repeatable as the simplest option.","b":"This is the hardest of the three to catch on a first listen. The words are longer and less common, which can sound impressive but often costs some immediate singability. That's not automatically wrong: a striking, less-repeatable hook can still work if the melody carries it.","c":"This is the easiest to catch immediately: short, repeated, and simple. Easy singability isn't the only thing that makes a hook work, but it's a real advantage this one has over the other two."}$$::jsonb
where lesson_id = '00000000-0000-4000-8000-000000000005' and order_index = 2;

-- Verify nothing was missed: both queries should return zero rows.
select id, title from public.lessons where description like '%—%' or title like '%—%';
select lesson_id, order_index from public.lesson_exercises
where prompt like '%—%' or feedback::text like '%—%' or options::text like '%—%';
