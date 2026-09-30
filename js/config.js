/* =====================================================================
   SKOVA FITNESS — SITE DATA. Fill this in before showing the client.
   SHOW_SAMPLES = true  -> empty sections show clearly-labelled sample data so the owner can see the feature.
   SHOW_SAMPLES = false -> empty sections hide or fall back to safe copy. Set this before going live.
   ===================================================================== */
var SHOW_SAMPLES = true;

var SITE = {
  city: "",        // e.g. "Kathmandu"
  address: "",     // e.g. "Street, area, landmark"
  phone: "",       // shown as typed, e.g. "+977 98XXXXXXXX"
  whatsapp: "",    // digits only, country code first, e.g. "97798XXXXXXXX"
  timezone: "Asia/Kathmandu",
  offer: "",       // one line, e.g. "Joining fee waived this month" (leave empty for none)
  // Opening hours, one entry per day, 24h "HH:MM". null = closed. Keys: sun mon tue wed thu fri sat
  hours: {},       // e.g. { sun:["05:00","21:00"], ..., sat:["06:00","12:00"] }
  // Prices per plan in NPR. Leave empty to show "ask at the desk".
  prices: {},      // e.g. { 1: 3500, 3: 9000, 6: 16000, 12: 28000 }
  // Timetable rows: { day, morning, afternoon, evening }; each slot is an array of { name, time, type } with type "coached" | "combat" | "open"
  timetable: [],
  // Coaches: { name, role, bio, photo (optional path), initials }
  coaches: [],
  // Shop products: { id, cat ("supplements" | "gear" | "merch"), name, blurb, price (NPR), image, sizes (optional array), badge (optional) }
  products: [],
  delivery: ""     // e.g. "Free pick-up at the gym. Delivery inside the city NPR 150." (leave empty for the default line)
};

var SAMPLE = {
  offer: "Joining fee waived for new members this month",
  hours: { sun:["05:00","21:00"], mon:["05:00","21:00"], tue:["05:00","21:00"], wed:["05:00","21:00"], thu:["05:00","21:00"], fri:["05:00","21:00"], sat:["06:00","12:00"] },
  prices: { 1: 3500, 3: 9000, 6: 16000, 12: 28000 },
  timetable: [
    { day:"sun", morning:[{name:"Open gym",time:"05:00–12:00",type:"open"}], afternoon:[{name:"Open gym",time:"12:00–17:00",type:"open"}], evening:[{name:"Boxing rounds",time:"18:00",type:"combat"},{name:"Open gym",time:"until 21:00",type:"open"}] },
    { day:"mon", morning:[{name:"Beginner induction",time:"06:30",type:"coached"},{name:"Open gym",time:"05:00–12:00",type:"open"}], afternoon:[{name:"Open gym",time:"12:00–17:00",type:"open"}], evening:[{name:"Strength class",time:"18:00",type:"coached"}] },
    { day:"tue", morning:[{name:"Open gym",time:"05:00–12:00",type:"open"}], afternoon:[{name:"Open gym",time:"12:00–17:00",type:"open"}], evening:[{name:"Boxing rounds",time:"18:00",type:"combat"}] },
    { day:"wed", morning:[{name:"Calisthenics basics",time:"06:30",type:"coached"}], afternoon:[{name:"Open gym",time:"12:00–17:00",type:"open"}], evening:[{name:"Strength class",time:"18:00",type:"coached"}] },
    { day:"thu", morning:[{name:"Open gym",time:"05:00–12:00",type:"open"}], afternoon:[{name:"Open gym",time:"12:00–17:00",type:"open"}], evening:[{name:"Boxing rounds",time:"18:00",type:"combat"}] },
    { day:"fri", morning:[{name:"Beginner induction",time:"06:30",type:"coached"}], afternoon:[{name:"Open gym",time:"12:00–17:00",type:"open"}], evening:[{name:"Conditioning",time:"18:00",type:"coached"}] },
    { day:"sat", morning:[{name:"Open gym",time:"06:00–12:00",type:"open"}], afternoon:[{name:"Closed",time:"",type:"open"}], evening:[{name:"Closed",time:"",type:"open"}] }
  ],
  coaches: [
    { name:"Coach name", role:"Head coach · Strength", bio:"Replace with a two-line bio: what they coach, how long they have trained, what they are known for on the floor.", initials:"SK" },
    { name:"Coach name", role:"Boxing · Combat zone", bio:"Replace with a two-line bio. Mention fights, belts or years on the pads if they have them.", initials:"BX" },
    { name:"Coach name", role:"Calisthenics · Rig", bio:"Replace with a two-line bio. The skills they teach: muscle-up, front lever, handstand.", initials:"CL" }
  ],
  products: [
    { id:"whey",     cat:"supplements", name:"Whey protein 1 kg",       blurb:"24 g protein per scoop. Chocolate or vanilla.",              price:6500, image:"img/product-whey.jpg", light:true,     badge:"Best seller" },
    { id:"creatine", cat:"supplements", name:"Creatine monohydrate 300 g", blurb:"Unflavoured, micronised. 5 g a day, every day.",           price:2800, image:"img/product-creatine.jpg" },
    { id:"preworkout", cat:"supplements", name:"Pre-workout 300 g",     blurb:"Caffeine, citrulline, beta-alanine. Half a scoop to start.", price:3900, image:"img/product-preworkout.jpg", light:true },
    { id:"shaker",   cat:"gear",        name:"Shaker 700 ml",            blurb:"Leak-proof lid, mixing ball, dishwasher safe.",               price:850,  image:"" },
    { id:"gloves",   cat:"gear",        name:"Boxing gloves 12 oz",      blurb:"Bag and pad work. Velcro wrist, black with green trim.",     price:4500, image:"img/product-gloves.jpg", sizes:["10 oz","12 oz","14 oz","16 oz"] },
    { id:"wraps",    cat:"gear",        name:"Hand wraps 4.5 m",         blurb:"Semi-elastic, thumb loop. Sold as a pair.",                  price:650,  image:"img/product-wraps.jpg", light:true },
    { id:"belt",     cat:"gear",        name:"Lifting belt",             blurb:"10 mm leather, single-prong steel buckle.",                  price:3200, image:"img/product-belt.jpg", sizes:["S","M","L","XL"] },
    { id:"straps",   cat:"gear",        name:"Lifting straps",           blurb:"Cotton with neoprene padding. Pair.",                        price:700,  image:"img/product-straps.jpg", light:true },
    { id:"tee",      cat:"merch",       name:"Skova tee",                blurb:"Heavyweight cotton, boxy cut, green chevron.",                price:1200, image:"img/product-tee.jpg", light:true, sizes:["S","M","L","XL","XXL"] },
    { id:"hoodie",   cat:"merch",       name:"Skova hoodie",             blurb:"Brushed fleece, kangaroo pocket, green chevron.",             price:2900, image:"img/product-hoodie.jpg", light:true, sizes:["S","M","L","XL","XXL"], badge:"New" },
    { id:"cap",      cat:"merch",       name:"Skova cap",                blurb:"Black six-panel, embroidered bolt, adjustable.",              price:900,  image:"img/product-cap.jpg", light:true },
    { id:"gymbag",   cat:"merch",       name:"Skova gym bag",            blurb:"35 L duffel in charcoal grey, shoe compartment.",             price:2400, image:"img/product-gymbag.jpg", light:true }
  ],
  delivery: "Free pick-up at the gym desk. Delivery inside the city NPR 150, paid on delivery."
};
