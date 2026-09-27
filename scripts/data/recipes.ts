/**
 * One recipe per launch premix, published to /blog by scripts/import-recipes.ts.
 *
 * Sambhar, Moong Dal Halwa and Rawa Idli follow the method printed on their back
 * labels. The other premixes don't have back labels yet, so their recipes say
 * "prepare as directed on the pack" for the premix step and only give quantities
 * for the fresh ingredients. Update them when the back labels are final.
 *
 * Content uses the blog's SimpleMarkdown: "## " headings, "- " bullets,
 * **bold** / *italic*, blank line between paragraphs. No numbered lists or links,
 * so method steps are written as "**1.** …" paragraphs.
 */

export type RecipeSeed = {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  cover: string;       // file in scripts/data/images/recipes
  content: string;
};

export const RECIPES: RecipeSeed[] = [
  {
    slug: "paneer-tikka-masala-recipe",
    title: "Restaurant-Style Paneer Tikka Masala at Home",
    excerpt: "Smoky pan-seared paneer and peppers simmered in our Paneer Tikka Gravy. Dinner for four in about 30 minutes.",
    metaDescription: "Easy paneer tikka masala made with Kanta Greens Paneer Tikka Gravy Premix: seared paneer, peppers and a rich gravy in about 30 minutes.",
    cover: "paneer-tikka.jpg",
    content: `Paneer tikka masala is the dish everyone orders when you eat out. With **Kanta Greens Paneer Tikka Gravy Premix** the gravy is already taken care of, so you can spend your time getting a good sear on the paneer.

## At a glance
- Serves 3–4
- Time: about 30 minutes
- Premix: 1 pack Paneer Tikka Gravy Premix

## You will need
- 1 pack Kanta Greens Paneer Tikka Gravy Premix
- 250 g paneer, cut into 1-inch cubes
- 1 green capsicum and 1 onion, cut into 1-inch squares
- 3 tbsp thick curd
- 1 tbsp oil or butter for searing
- 1 tsp kasuri methi (dried fenugreek leaves)
- 2 tbsp fresh cream (optional)
- Fresh coriander to garnish

## Method
**1.** Mix the paneer, capsicum and onion with the curd and a pinch of salt. Leave for 10 minutes while you start the gravy.

**2.** Prepare the gravy with the premix and water as directed on the pack, and let it simmer.

**3.** Heat the oil or butter in a flat pan until hot. Add the paneer and vegetables in a single layer and cook without stirring for 2 minutes, until the edges char lightly. Turn and sear the other side.

**4.** Tip the seared paneer and vegetables into the gravy and simmer for 3–4 minutes.

**5.** Crush the kasuri methi between your palms over the pan, stir in the cream if using, and switch off the heat.

**6.** Garnish with coriander and serve hot.

## Tips
- A very hot pan is the secret to the "tikka" flavour: don't crowd the paneer or it will steam instead of char.
- Soak the paneer in warm salted water for 10 minutes first if it feels firm; it stays soft in the gravy.

## Serve with
- Butter naan, lachha paratha or jeera rice
- Sliced onions and a squeeze of lemon`,
  },
  {
    slug: "rawa-idli-recipe",
    title: "Soft, Fluffy Rawa Idli in 20 Minutes",
    excerpt: "No soaking, no grinding, no fermenting. Our Rawa Idli Premix gives you 12–15 soft idlis in about 20 minutes.",
    metaDescription: "Make soft rawa idli in 20 minutes with Kanta Greens Rawa Idli Premix. No soaking, grinding or fermenting. Makes 12–15 idlis.",
    cover: "rawa-idli.jpg",
    content: `Regular idli needs overnight soaking, grinding and fermenting. Rawa idli doesn't. With **Kanta Greens Rawa Idli Premix**, breakfast is on the table about 20 minutes after you decide you want idlis.

## At a glance
- Makes 12–15 idlis (serves 3–4)
- Time: about 20 minutes
- Premix: 1 packet (220 g) Rawa Idli Premix
- No onion, no garlic

## You will need
- 1 packet (220 g) Kanta Greens Rawa Idli Premix
- 200 ml water
- 1 cup (140 g) curd
- A little oil for greasing
- Idli stand and steamer (or a pressure cooker without the whistle)

## Method
**1.** Take 1 packet (220 g) of premix and add 200 ml water and 1 cup (140 g) curd.

**2.** Mix well to a smooth batter and keep aside for 5 minutes.

**3.** Grease the idli moulds with a little oil.

**4.** Pour the batter into the moulds.

**5.** Steam for 8–10 minutes on a medium flame.

**6.** Remove and serve hot with chutney and sambhar.

## Tips
- The batter should be thick but pourable. If it has thickened too much after resting, stir in a spoonful of water.
- Rest the steamed idlis for a minute before unmoulding, then run a wet spoon around each one. They come out clean.
- For a colourful version, stir a little grated carrot and chopped coriander into the batter before steaming.

## Serve with
- Kanta Greens Coconut Chutney
- A bowl of Kanta Greens Sambhar`,
  },
  {
    slug: "moong-dal-halwa-recipe",
    title: "Moong Dal Halwa in 15 Minutes (Not 2 Hours)",
    excerpt: "The festive favourite without the hour of stirring. Roast, add milk, and a rich moong dal halwa is ready in about 15 minutes.",
    metaDescription: "Quick moong dal halwa with Kanta Greens Moong Dal Halwa Premix. Roast in ghee, add milk and it's ready in about 15 minutes.",
    cover: "halwa.jpg",
    content: `Moong dal halwa is the dessert everyone loves and nobody wants to make: soaking, grinding and a long, arm-aching stir in ghee. **Kanta Greens Moong Dal Halwa Premix** already has the moong dal, ghee, milk powder, sugar, nuts and cardamom in it, so the slow part is done.

## At a glance
- Serves 3–4
- Time: about 15 minutes
- Premix: 1 packet (150 g) Moong Dal Halwa Premix

## You will need
- 1 packet (150 g) Kanta Greens Moong Dal Halwa Premix
- 30 ml (2 tbsp) ghee
- 1½ cups (375 ml) milk or water
- Sliced almonds and pistachios to garnish (optional)
- A few strands of saffron soaked in 1 tbsp warm milk (optional)

## Method
**1.** Heat 30 ml (2 tbsp) ghee in a heavy pan. Add 1 packet (150 g) of premix and roast for 2–3 minutes, stirring, until it smells nutty.

**2.** Add 1½ cups (375 ml) milk or water and cook for 8–10 minutes, stirring, until the halwa thickens and leaves the sides of the pan.

**3.** Stir in the saffron milk if using, garnish with almonds and pistachios, and serve hot.

## Tips
- Milk makes a richer, creamier halwa; water gives a lighter, more grainy texture. Try half and half.
- Keep the flame low to medium while roasting so the premix turns golden, not brown.
- Leftovers keep in the fridge for 2 days. Warm with a splash of milk before serving.

## Serve with
- On its own, warm, after dinner
- A scoop of vanilla ice cream for a hot-and-cold treat`,
  },
  {
    slug: "drumstick-vegetable-sambhar-recipe",
    title: "Homestyle Drumstick & Vegetable Sambhar",
    excerpt: "A comforting pot of sambhar with drumsticks and vegetables, pressure-cooked in minutes and finished with a crackling tadka.",
    metaDescription: "Drumstick and vegetable sambhar made with Kanta Greens Sambhar Premix. Pressure-cooked in minutes, finished with mustard-curry leaf tadka.",
    cover: "sambhar.jpg",
    content: `Good sambhar needs tur dal, tamarind and a carefully roasted masala. **Kanta Greens Sambhar Premix** has all of that, blended and ready, so all you add is water, vegetables and a quick tadka.

## At a glance
- Serves 3–4
- Time: about 20 minutes
- Premix: 4 tbsp (50 g) Sambhar Premix per pot, so one 100 g pack makes two pots
- No onion, no garlic

## You will need
- 4 tbsp (50 g) Kanta Greens Sambhar Premix
- 500 ml water
- 3 tbsp oil
- ½ cup bottle gourd, 1 small carrot, 1 small brinjal, cut into chunks
- 2–3 drumsticks, cut into 3-inch pieces

For the tadka:
- 1 tsp oil or ghee
- ½ tsp mustard seeds
- 8–10 curry leaves
- 2 whole dry red chillies

## Method
**1.** Take 4 tbsp (50 g) of premix, add 500 ml water and mix well.

**2.** In a pressure cooker, heat 3 tbsp oil. Add the bottle gourd, carrot, brinjal and drumsticks, and sauté for 2–3 minutes.

**3.** Pour in the premix water, close the cooker and cook for 2 whistles. Let the pressure drop on its own.

**4.** For better taste, make a tadka: heat the oil or ghee, add the mustard seeds, curry leaves and whole red chillies, and pour it over the sambhar as the seeds crackle.

**5.** Serve hot.

## Tips
- Any mix of vegetables works: pumpkin, shallots, radish and okra are all classic.
- Sambhar thickens as it stands. Loosen it with a little hot water before serving.

## Serve with
- Steamed rice and a spoon of ghee
- Kanta Greens Rawa Idli, or dosa and vada`,
  },
  {
    slug: "coconut-chutney-recipe",
    title: "South Indian Coconut Chutney, No Grating Needed",
    excerpt: "The classic partner for idli and dosa, without cracking or grating a coconut. Finish with a sizzling mustard and curry leaf tadka.",
    metaDescription: "Easy South Indian coconut chutney with Kanta Greens Coconut Chutney Premix and a mustard-curry leaf tadka. Perfect with idli and dosa.",
    cover: "coconut-chutney.jpg",
    content: `No idli or dosa is complete without coconut chutney, but cracking and grating a coconut on a weekday morning is another matter. **Kanta Greens Coconut Chutney Premix** skips that step. All it needs is a proper tadka.

## At a glance
- Serves 3–4
- Time: about 10 minutes
- Premix: Coconut Chutney Premix
- No onion, no garlic

## You will need
- Kanta Greens Coconut Chutney Premix (quantity as directed on the pack)

For the tadka:
- 1 tsp coconut oil or any oil
- ½ tsp mustard seeds
- ½ tsp urad dal
- 1 dry red chilli, broken
- 8–10 curry leaves
- A pinch of hing

## Method
**1.** Prepare the chutney with the premix as directed on the pack, and transfer it to a serving bowl.

**2.** Heat the oil in a small pan. Add the mustard seeds and let them crackle.

**3.** Add the urad dal and fry until light golden, then add the red chilli, curry leaves and hing. Take the pan off the heat as the curry leaves turn crisp.

**4.** Pour the tadka over the chutney and stir just before serving.

## Tips
- Coconut oil gives the most authentic South Indian flavour to the tadka.
- The chutney thickens as it sits; stir in a little water to loosen it.

## Serve with
- Kanta Greens Rawa Idli
- Dosa, uttapam, vada or upma`,
  },
  {
    slug: "punjabi-chhole-recipe",
    title: "Punjabi Chhole, Just Like the Dhaba",
    excerpt: "Dark, tangy Punjabi chhole with soft chickpeas, finished with ginger, green chilli and lemon. Made easy with our Chhole Masala Premix.",
    metaDescription: "Dhaba-style Punjabi chhole with Kanta Greens Chhole Masala Premix: soft chickpeas, tangy masala, ginger and lemon. Serve with bhature.",
    cover: "chhole.jpg",
    content: `Sunday chhole-bhature is a Punjabi institution. The chickpeas are easy; it's the masala that takes time. **Kanta Greens Chhole Masala Premix** brings the depth and tang, so you can focus on the bhature.

## At a glance
- Serves 3–4
- Time: about 30 minutes (plus soaking the chickpeas)
- Premix: 1 pack Chhole Masala Premix

## You will need
- 1 pack Kanta Greens Chhole Masala Premix
- 1 cup dried chickpeas (kabuli chana), soaked overnight, or 2 cans, drained
- 1 tea bag (optional, for the classic dark colour)
- 1-inch piece of ginger, cut into thin strips
- 2 green chillies, slit
- 1 onion, sliced into rings, and lemon wedges to serve
- Fresh coriander

## Method
**1.** Pressure-cook the soaked chickpeas with fresh water, a little salt and the tea bag for 5–6 whistles, until very soft. Discard the tea bag and keep the cooking water.

**2.** Prepare the gravy with the premix as directed on the pack, using some of the chickpea cooking water in place of plain water for extra flavour.

**3.** Add the chickpeas and simmer for 10 minutes. Mash a few chickpeas against the side of the pan to thicken the gravy.

**4.** Add the ginger strips and green chillies and simmer for 2 more minutes.

**5.** Garnish with coriander and serve with onion rings and lemon wedges.

## Tips
- Chhole taste even better the next day, once the chickpeas have soaked up the masala.
- Canned chickpeas work in a hurry: rinse them well and simmer a little longer.

## Serve with
- Bhature, kulche or puri
- Jeera rice and a side of pickled onions`,
  },
  {
    slug: "no-onion-no-garlic-chhole-recipe",
    title: "No Onion No Garlic Chhole for Every Occasion",
    excerpt: "All the tang of Punjabi chhole, made without onion or garlic. A satvik favourite for puja days and every day.",
    metaDescription: "No onion no garlic chhole with Kanta Greens Chhole Masala Premix (No Onion No Garlic). Tangy, satvik and perfect with puri.",
    cover: "chhole.jpg",
    content: `Many households cook without onion and garlic on puja days, during certain months, or always. **Kanta Greens Chhole Masala Premix (No Onion No Garlic)** is made for exactly that, so nobody has to miss out on a good plate of chhole.

## At a glance
- Serves 3–4
- Time: about 30 minutes (plus soaking the chickpeas)
- Premix: 1 pack Chhole Masala Premix (No Onion No Garlic)
- No onion, no garlic

## You will need
- 1 pack Kanta Greens Chhole Masala Premix (No Onion No Garlic)
- 1 cup dried chickpeas, soaked overnight, or 2 cans, drained
- 1 tomato, finely chopped (optional, for extra tang)
- 1-inch piece of ginger, cut into thin strips
- 2 green chillies, slit
- 1 tbsp ghee
- Fresh coriander and lemon wedges

## Method
**1.** Pressure-cook the soaked chickpeas with fresh water and a little salt for 5–6 whistles, until very soft. Keep the cooking water.

**2.** Heat the ghee in a pan and cook the tomato, if using, until soft.

**3.** Add the premix and water as directed on the pack, and bring to a simmer.

**4.** Add the chickpeas and simmer for 10 minutes, mashing a few to thicken the gravy.

**5.** Add the ginger and green chillies, simmer for 2 minutes, then garnish with coriander.

**6.** Serve hot with lemon wedges.

## Tips
- Ghee gives this satvik version a lovely richness in place of onion.
- Want it drier, for chaat? Simmer uncovered until the gravy coats the chickpeas, then top with chopped tomato and a squeeze of lemon.

## Serve with
- Hot puri or bhature
- Plain rice or jeera rice`,
  },
  {
    slug: "no-onion-no-garlic-paneer-tikka-masala-recipe",
    title: "Satvik Paneer Tikka Masala (No Onion No Garlic)",
    excerpt: "Rich, festive paneer tikka masala made entirely without onion or garlic. Seared paneer and peppers in our No Onion No Garlic gravy.",
    metaDescription: "No onion no garlic paneer tikka masala with Kanta Greens Paneer Tikka Gravy Premix (No Onion No Garlic). Rich, satvik and ready in 30 minutes.",
    cover: "paneer-tikka.jpg",
    content: `Cooking without onion and garlic shouldn't mean giving up your favourite restaurant dishes. **Kanta Greens Paneer Tikka Gravy Premix (No Onion No Garlic)** gives you the full tikka masala experience for satvik kitchens, fasting-day menus and family members who skip onion and garlic.

## At a glance
- Serves 3–4
- Time: about 30 minutes
- Premix: 1 pack Paneer Tikka Gravy Premix (No Onion No Garlic)
- No onion, no garlic

## You will need
- 1 pack Kanta Greens Paneer Tikka Gravy Premix (No Onion No Garlic)
- 250 g paneer, cut into 1-inch cubes
- 1 green capsicum and 1 tomato (seeds removed), cut into 1-inch squares
- 3 tbsp thick curd
- 1 tbsp ghee for searing
- 1 tsp kasuri methi
- 2 tbsp fresh cream (optional)

## Method
**1.** Mix the paneer, capsicum and tomato with the curd and a pinch of salt. Leave for 10 minutes.

**2.** Prepare the gravy with the premix and water as directed on the pack, and let it simmer.

**3.** Heat the ghee in a flat pan until hot and sear the paneer and vegetables in a single layer for about 2 minutes on each side, until lightly charred.

**4.** Add them to the gravy and simmer for 3–4 minutes.

**5.** Crush the kasuri methi over the pan, stir in the cream if using, and serve.

## Tips
- Searing in ghee adds depth that makes up for the missing onion.
- Cut everything the same size so the paneer and vegetables cook evenly.

## Serve with
- Tandoori roti, puri or paratha
- Jeera rice`,
  },
  {
    slug: "navratan-korma-white-gravy-recipe",
    title: "Navratan Korma with White Gravy Premix",
    excerpt: "Nine jewels in a creamy white gravy: mixed vegetables, paneer and dry fruit in a mild, festive korma made without onion or garlic.",
    metaDescription: "Creamy navratan korma with Kanta Greens White Gravy Premix: mixed vegetables, paneer and dry fruit in a mild, no onion no garlic gravy.",
    cover: "white-gravy.jpg",
    content: `Navratan korma, the "nine jewels" curry, is a mild, creamy, gently sweet dish that's perfect for festive meals and for anyone who doesn't like things too spicy. **Kanta Greens White Gravy Premix** makes the creamy base, and you add the jewels.

## At a glance
- Serves 3–4
- Time: about 30 minutes
- Premix: 1 pack White Gravy Premix
- No onion, no garlic

## You will need
- 1 pack Kanta Greens White Gravy Premix
- 2 cups mixed vegetables, cut small: carrot, beans, peas, cauliflower, potato
- 100 g paneer, cubed
- 2 tbsp mixed cashews and raisins
- 2–3 tbsp pineapple pieces (optional, classic in navratan korma)
- 1 tbsp ghee
- 2 tbsp cream (optional)

## Method
**1.** Steam or boil the mixed vegetables until just tender, and drain.

**2.** Heat the ghee in a pan and fry the cashews and raisins for a minute until the raisins puff up. Remove and keep aside.

**3.** In the same pan, prepare the gravy with the premix as directed on the pack.

**4.** Add the vegetables and paneer and simmer for 4–5 minutes.

**5.** Stir in the cream and pineapple if using, top with the fried cashews and raisins, and serve.

## Tips
- Don't overcook the vegetables: they should hold their shape and colour in the korma.
- The same gravy makes excellent shahi paneer or malai chicken. Just swap the vegetables.

## Serve with
- Butter naan or kulcha
- Peas pulao or saffron rice`,
  },
  {
    slug: "egg-curry-all-purpose-gravy-recipe",
    title: "Dhaba-Style Egg Curry (or Paneer, or Veg) in 20 Minutes",
    excerpt: "One gravy, endless dishes. Here's a quick egg curry with our All Purpose Gravy Premix, plus easy swaps for paneer, chana or vegetables.",
    metaDescription: "Quick dhaba-style egg curry with Kanta Greens All Purpose Gravy Premix. Easy swaps for paneer, chana or mixed vegetables.",
    cover: "all-purpose-gravy.jpg",
    content: `**Kanta Greens All Purpose Gravy Premix** is the one to keep in the cupboard for "what's for dinner?" evenings. It's a versatile, onion-and-garlic-free masala base that works with almost anything. Our favourite quick dinner is a dhaba-style egg curry.

## At a glance
- Serves 3–4
- Time: about 20 minutes
- Premix: 1 pack All Purpose Gravy Premix
- The premix itself contains no onion or garlic

## You will need
- 1 pack Kanta Greens All Purpose Gravy Premix
- 6 eggs, hard-boiled and peeled
- 1 tbsp oil
- ¼ tsp turmeric and ¼ tsp red chilli powder
- Fresh coriander

## Method
**1.** Make 3–4 shallow slits on each boiled egg so the gravy can soak in.

**2.** Heat the oil in a pan, sprinkle in the turmeric and chilli powder, and add the eggs. Fry for 2 minutes, turning, until they get a golden crust.

**3.** Remove the eggs, and in the same pan prepare the gravy with the premix as directed on the pack.

**4.** Return the eggs to the gravy and simmer for 5 minutes.

**5.** Garnish with coriander and serve.

## Make it your way
- **Paneer:** swap the eggs for 250 g paneer cubes, lightly fried.
- **Chana:** use 2 cups boiled chickpeas and simmer for 10 minutes.
- **Mixed veg:** add 3 cups steamed vegetables (potato, peas, carrot, beans).
- **Chicken:** cook 500 g chicken pieces in the gravy until done, adding a little more water as needed.

## Serve with
- Hot rotis or parathas
- Steamed rice and sliced onions`,
  },
  {
    slug: "vegetable-dum-biryani-recipe",
    title: "Easy Vegetable Dum Biryani",
    excerpt: "Fragrant layers of basmati rice and spiced vegetables, sealed and slow-cooked on dum. Our Biryani Premix does the spice work.",
    metaDescription: "Easy vegetable dum biryani with Kanta Greens Biryani Premix: layered basmati rice and spiced vegetables, no onion no garlic.",
    cover: "biryani.jpg",
    content: `A good biryani needs a long list of whole and ground spices. **Kanta Greens Biryani Premix** puts them all in one pack, made without onion or garlic, so a weekend biryani becomes something you can make on a weeknight.

## At a glance
- Serves 3–4
- Time: about 50 minutes (including soaking the rice)
- Premix: 1 pack Biryani Premix
- No onion, no garlic

## You will need
- 1 pack Kanta Greens Biryani Premix
- 1½ cups basmati rice
- 3 cups mixed vegetables: carrot, beans, peas, cauliflower, potato
- 100 g paneer, cubed (optional)
- ½ cup curd
- 2 tbsp ghee
- A few mint and coriander leaves
- A pinch of saffron in 2 tbsp warm milk (optional)

## Method
**1.** Rinse the rice until the water runs clear and soak it for 30 minutes.

**2.** Boil the rice in plenty of salted water until it is about 70% cooked (it should still have a bite). Drain.

**3.** Heat 1 tbsp ghee in a heavy pot. Add the vegetables and cook the masala with the premix and curd as directed on the pack, until the vegetables are nearly done. Add the paneer if using.

**4.** Spread the rice evenly over the vegetables. Scatter mint and coriander, drizzle the saffron milk and the remaining ghee on top.

**5.** Cover tightly with a lid (seal the edge with a strip of dough or foil for proper dum) and cook on the lowest flame for 15–20 minutes.

**6.** Rest for 5 minutes, then gently mix from the side so the layers stay intact, and serve.

## Tips
- Undercooking the rice slightly before layering is the key to separate, fluffy grains.
- Place a flat tawa under the pot during dum so the bottom doesn't burn.
- Swap the vegetables for chicken if you like: cook it fully in the masala before layering.

## Serve with
- Cucumber raita
- A simple salad of onion, cucumber and lemon`,
  },
];
