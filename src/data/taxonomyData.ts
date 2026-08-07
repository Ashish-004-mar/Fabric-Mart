export interface FabricSubcategoryDef {
  id: string;
  name: string;
  slug: string;
  description: string;
  characteristics: string[];
  commonApplications: string[];
}

export interface FabricCategoryDef {
  id: string;
  name: string;
  slug: string;
  mainFamily: string;
  description: string;
  image: string;
  subcategories: FabricSubcategoryDef[];
}

export interface FabricMainFamilyDef {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  badgeColor: string;
  categories: FabricCategoryDef[];
}

export const FABRIC_TAXONOMY: FabricCategoryDef[] = [
  // 1. Natural Plant-Based Fabrics
  {
    id: 'cat-cotton',
    name: 'Cotton',
    slug: 'cotton',
    mainFamily: 'Natural Plant-Based Fabrics',
    description: 'Soft, breathable staple fiber harvested from cotton plants. Highly versatile for apparel, shirting, and home textiles.',
    image: 'https://images.pexels.com/photos/6292/blue-pattern-texture-macro.jpg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-upland-cotton',
        name: 'Upland Cotton',
        slug: 'upland-cotton',
        description: 'The most widely cultivated American cotton fiber, valued for affordability, comfort, and versatile everyday weaving.',
        characteristics: ['Medium staple fiber', 'Highly breathable', 'Soft hand feel', 'Durable everyday wear'],
        commonApplications: ['T-Shirts', 'Casual Shirting', 'Denim Blends', 'Bedding'],
      },
      {
        id: 'subcat-egyptian-cotton',
        name: 'Egyptian Cotton',
        slug: 'egyptian-cotton',
        description: 'Extra-long staple (ELS) luxury cotton grown in the Nile River Valley, renowned for exceptional lustre and silky smoothness.',
        characteristics: ['Extra-long staple', 'High thread count potential', 'Luminous lustre', 'Ultra-durable & pill resistant'],
        commonApplications: ['Luxury Bedding', 'Bespoke Dress Shirts', 'High-End Hotel Linens'],
      },
      {
        id: 'subcat-pima-cotton',
        name: 'Pima Cotton (Supima)',
        slug: 'pima-cotton',
        description: 'Premium American-grown ELS cotton with superior fiber strength, softness, and vibrant color retention.',
        characteristics: ['Ultra-long staple', 'Rich color depth', 'Silk-like hand feel', 'Resistant to fraying & pilling'],
        commonApplications: ['Luxury T-Shirts', 'Undergarments', 'Fine Knitwear', 'Premium Loungewear'],
      },
      {
        id: 'subcat-organic-cotton',
        name: 'Organic Cotton',
        slug: 'organic-cotton',
        description: 'GOTS-certified non-GMO cotton cultivated without synthetic pesticides or chemical fertilizers.',
        characteristics: ['100% Eco-Friendly', 'Hypoallergenic', 'Zero chemical residue', 'Soil & water preserving'],
        commonApplications: ['Infant Apparel', 'Sensitive Skin Wear', 'Eco-Fashion Lines', 'Organic Bedding'],
      },
    ],
  },
  {
    id: 'cat-linen',
    name: 'Linen',
    slug: 'linen',
    mainFamily: 'Natural Plant-Based Fabrics',
    description: 'Crisp, highly breathable textile made from flax plant fibers. Known for natural slub texture and rapid heat dissipation.',
    image: 'https://images.pexels.com/photos/7794364/pexels-photo-7794364.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-damask-linen',
        name: 'Damask Linen',
        slug: 'damask-linen',
        description: 'Reversible jacquard-woven linen featuring satin and matte contrast patterns for formal dining and luxury decor.',
        characteristics: ['Reversible pattern', 'Lustrous sheen contrast', 'Formal heavy drape', 'Heritage heirloom quality'],
        commonApplications: ['Table Linens', 'Formal Napkins', 'Luxury Upholstery', 'Decorative Drapery'],
      },
      {
        id: 'subcat-plain-woven-linen',
        name: 'Plain-Woven Linen',
        slug: 'plain-woven-linen',
        description: 'Classic crisp flax weave with prominent natural slub threads, ideal for summer tailoring and shirting.',
        characteristics: ['Crisp structure', 'High breathability', 'Natural slub texture', 'Softens with every wash'],
        commonApplications: ['Summer Blazers', 'Linen Shirts', 'Trousers', 'Dresses'],
      },
      {
        id: 'subcat-loosely-woven-linen',
        name: 'Loosely-Woven Linen',
        slug: 'loosely-woven-linen',
        description: 'Airy, open-weave flax fabric offering maximum ventilation and soft fluid movement.',
        characteristics: ['Semi-sheer opacity', 'Ultra-breathable', 'Lightweight GSM', 'Relaxed casual drape'],
        commonApplications: ['Airy Curtains', 'Beach Cover-Ups', 'Light Scarves', 'Summer Tunics'],
      },
      {
        id: 'subcat-sheeting-linen',
        name: 'Sheeting Linen',
        slug: 'sheeting-linen',
        description: 'Wide-width tightly woven linen engineered for smooth, durable bed sheets and interior furnishings.',
        characteristics: ['Wide continuous roll', 'Cool moisture regulation', 'Soft stonewashed option', 'Long lifespan'],
        commonApplications: ['Duvet Covers', 'Bespoke Bed Sheets', 'Pillowcases', 'Light Slipcovers'],
      },
    ],
  },
  {
    id: 'cat-hemp',
    name: 'Hemp',
    slug: 'hemp',
    mainFamily: 'Natural Plant-Based Fabrics',
    description: 'Ultra-sustainable bast fiber from Cannabis sativa plant. 8x stronger than cotton with natural anti-microbial protection.',
    image: 'https://images.pexels.com/photos/7605099/pexels-photo-7605099.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-hemp-canvas',
        name: 'Hemp Canvas',
        slug: 'hemp-canvas',
        description: 'Heavy-duty rugged woven hemp fabric with extreme tensile strength and UV resistance.',
        characteristics: ['Extreme abrasion resistance', 'UV blocking', 'Mold & mildew resistant', 'Zero pesticide crop'],
        commonApplications: ['Backpacks', 'Workwear Outerwear', 'Upholstery', 'Heavy Tote Bags'],
      },
      {
        id: 'subcat-hemp-linen',
        name: 'Hemp Linen',
        slug: 'hemp-linen',
        description: 'Refined fine-spun hemp yarn woven into a texture resembling flax linen with added durability.',
        characteristics: ['Breathable', 'Antimicrobial', 'High wet strength', 'Softens progressively'],
        commonApplications: ['Eco Trousers', 'Summer Jackets', 'Home Curtains', 'Table Runners'],
      },
      {
        id: 'subcat-hemp-jersey',
        name: 'Hemp Jersey',
        slug: 'hemp-jersey',
        description: 'Stretch knit fabric combining fine hemp yarn with organic cotton or elastane for casual wear.',
        characteristics: ['Natural temperature control', 'Odour resistant', 'Comfort stretch', 'Earthy drape'],
        commonApplications: ['Eco T-Shirts', 'Activewear Tops', 'Loungewear', 'Infant Clothes'],
      },
    ],
  },
  {
    id: 'cat-bamboo',
    name: 'Bamboo',
    slug: 'bamboo',
    mainFamily: 'Natural Plant-Based Fabrics',
    description: 'Fast-renewing cellulose fiber harvested from bamboo stalks. Hypoallergenic, silky, and naturally thermoregulating.',
    image: 'https://images.pexels.com/photos/7232500/pexels-photo-7232500.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-bamboo-viscose',
        name: 'Bamboo Viscose',
        slug: 'bamboo-viscose',
        description: 'Regenerated bamboo pulp processed into a buttery-soft, luminous draped textile.',
        characteristics: ['Silky luster', 'Hypoallergenic', 'Moisture-absorbing', 'Silky soft touch'],
        commonApplications: ['Sleepwear', 'Bed Sheets', 'Underwear', 'Flowy Dresses'],
      },
      {
        id: 'subcat-bamboo-lyocell',
        name: 'Bamboo Lyocell (Tencel Bamboo)',
        slug: 'bamboo-lyocell',
        description: 'Closed-loop eco-processed bamboo fiber utilizing non-toxic organic solvents.',
        characteristics: ['100% Closed-loop production', 'Zero chemical leaching', 'Silky cool touch', 'Strong wet fiber'],
        commonApplications: ['Sustainable Activewear', 'Luxury Bedding', 'Sensitive Skin Wear'],
      },
      {
        id: 'subcat-bamboo-linen',
        name: 'Bamboo Linen',
        slug: 'bamboo-linen',
        description: 'Mechanically processed natural bamboo bast fibers woven into a structured texture similar to flax linen.',
        characteristics: ['Crisp slub texture', 'Naturally antimicrobial', 'Zero chemical solvents', 'Biodegradable'],
        commonApplications: ['Summer Tailoring', 'Eco Shirting', 'Home Soft Goods'],
      },
    ],
  },
  {
    id: 'cat-canvas',
    name: 'Canvas',
    slug: 'canvas',
    mainFamily: 'Natural Plant-Based Fabrics',
    description: 'Extremely durable plain-woven fabric historically crafted from cotton, hemp, or flax for heavy-duty utility.',
    image: 'https://images.pexels.com/photos/29060166/pexels-photo-29060166.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-duck-canvas',
        name: 'Duck Canvas',
        slug: 'duck-canvas',
        description: 'Tightly woven heavy cotton canvas with smooth surface, high thread density, and wind protection.',
        characteristics: ['Snag resistant', 'Windproof weave', 'High GSM (300-500)', 'Stiff structural form'],
        commonApplications: ['Work Wear Jackets', 'Tote Bags', 'Sneakers', 'Artists Canvases'],
      },
      {
        id: 'subcat-plain-canvas',
        name: 'Plain Canvas',
        slug: 'plain-canvas',
        description: 'Standard medium-weight plain weave utility canvas for multipurpose craft, bags, and drapery.',
        characteristics: ['Multipurpose utility', 'Easy to dye & print', 'Balanced warp and weft', 'Cost effective'],
        commonApplications: ['Drop Cloths', 'Aprons', 'Light Tote Bags', 'Slipcovers'],
      },
    ],
  },

  // 2. Natural Animal-Based Fabrics
  {
    id: 'cat-wool',
    name: 'Wool',
    slug: 'wool',
    mainFamily: 'Natural Animal-Based Fabrics',
    description: 'Warm, crimped animal protein fleece harvested from sheep, goats, or alpacas. Natural insulator and flame resistant.',
    image: 'https://images.pexels.com/photos/6634556/pexels-photo-6634556.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-merino-wool',
        name: 'Merino Wool',
        slug: 'merino-wool',
        description: 'Superfine wool from Merino sheep (<19.5 microns) that does not itch. Thermoregulating and odour resistant.',
        characteristics: ['Non-itchy fine fibers', 'Thermal insulation', 'Natural moisture control', 'Odour resistant'],
        commonApplications: ['Bespoke Suits', 'Thermal Activewear', 'Fine Sweaters', 'Socks'],
      },
      {
        id: 'subcat-cashmere',
        name: 'Cashmere',
        slug: 'cashmere',
        description: 'Ultra-luxurious undercoat hair of Cashmere goats, offering lightweight extreme insulation and cloud softness.',
        characteristics: ['Extreme softness', '3x warmer than sheep wool', 'Featherlight weight', 'High prestige value'],
        commonApplications: ['Luxury Sweaters', 'Scarves', 'Coats', 'Throws'],
      },
      {
        id: 'subcat-alpaca-wool',
        name: 'Alpaca Wool',
        slug: 'alpaca-wool',
        description: 'Hollow-core fleece harvested from South American alpacas. Lighter and warmer than sheep wool without lanolin.',
        characteristics: ['Lanolin free (hypoallergenic)', 'Hollow fiber insulation', 'Water repellent', 'Silky lustre'],
        commonApplications: ['Winter Coats', 'Knit Ponchos', 'Luxury Scarves', 'Blankets'],
      },
      {
        id: 'subcat-mohair',
        name: 'Mohair',
        slug: 'mohair',
        description: 'Lustrous, resilient fleece from Angora goats, celebrated for high sheen, elasticity, and flame resistance.',
        characteristics: ['High silk-like sheen', 'Takes dye vibrantly', 'Non-creasing', 'Flame retardant'],
        commonApplications: ['Evening Dinner Jackets', 'Plush Blankets', 'Luxury Knitwear'],
      },
      {
        id: 'subcat-angora',
        name: 'Angora',
        slug: 'angora',
        description: 'Silky, fluffy fur harvested from Angora rabbits with unmatched halo warmth and softness.',
        characteristics: ['Distinctive fluffy halo', 'Extreme thermal heat retention', 'Soft hand feel', 'Lightweight'],
        commonApplications: ['Luxury Accessories', 'Winter Hats', 'Knit Cardigans'],
      },
    ],
  },
  {
    id: 'cat-silk',
    name: 'Silk',
    slug: 'silk',
    mainFamily: 'Natural Animal-Based Fabrics',
    description: 'Continuous natural protein filament spun by silkworms. Famous for pearlescent lustre, strength, and fluidity.',
    image: 'https://images.pexels.com/photos/18877232/pexels-photo-18877232.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-mulberry-silk',
        name: 'Mulberry Silk',
        slug: 'mulberry-silk',
        description: 'The highest quality cultivated silk spun by Bombyx mori silkworms fed exclusively on Mulberry leaves.',
        characteristics: ['Uniform pure filaments', 'Pearlescent sheen', 'Hypoallergenic', 'Strong natural fiber'],
        commonApplications: ['Bridal Gowns', 'High-End Pillowcases', 'Couture Apparel', 'Lingerie'],
      },
      {
        id: 'subcat-tussah-silk',
        name: 'Tussah Silk',
        slug: 'tussah-silk',
        description: 'Wild silk harvested from forest silkworms with a natural golden-honey hue and rich slub texture.',
        characteristics: ['Wild textured slub', 'Natural tan/gold hue', 'More porous and breathable', 'Rustic luxury'],
        commonApplications: ['Summer Jackets', 'Decorative Curtains', 'Textured Scarves'],
      },
      {
        id: 'subcat-charmeuse',
        name: 'Charmeuse',
        slug: 'charmeuse',
        description: 'Satin-weave silk fabric with a shiny reflective face and a dull, matte crepe back.',
        characteristics: ['Reflective mirror luster', 'Fluid, liquid drape', 'Glides on skin', 'Lightweight GSM'],
        commonApplications: ['Evening Dresses', 'Blouses', 'Lingerie', 'Linings'],
      },
      {
        id: 'subcat-dupioni',
        name: 'Dupioni',
        slug: 'dupioni',
        description: 'Crisp plain-weave silk woven using uneven double-cocoons, creating irregular slubs and sculptural volume.',
        characteristics: ['Crisp structural body', 'Prominent slub knots', 'Shot-silk iridescent effect', 'Holds shape'],
        commonApplications: ['Formal Ballgowns', 'Bridal Wear', 'Drapery', 'Structured Jackets'],
      },
    ],
  },
  {
    id: 'cat-leather-suede',
    name: 'Leather & Suede',
    slug: 'leather-suede',
    mainFamily: 'Natural Animal-Based Fabrics',
    description: 'Tanned animal hides providing unmatched wind protection, abrasion resistance, and timeless luxury.',
    image: 'https://images.pexels.com/photos/34860667/pexels-photo-34860667.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-full-grain-leather',
        name: 'Full-Grain Leather',
        slug: 'full-grain-leather',
        description: 'Unblemished top layer of hide containing full grain density, developing a rich patina with age.',
        characteristics: ['Maximum durability', 'Develops rich patina', 'Water resistant when treated', 'Authentic pore texture'],
        commonApplications: ['Bespoke Boots', 'Luxury Handbags', 'Executive Furniture', 'Jackets'],
      },
      {
        id: 'subcat-top-grain-leather',
        name: 'Top-Grain Leather',
        slug: 'top-grain-leather',
        description: 'Slightly sanded upper layer of hide coated with a stain-resistant finish for smooth consistency.',
        characteristics: ['Uniform surface', 'Stain resistant', 'Flexible & supple', 'Easier maintenance'],
        commonApplications: ['Car Upholstery', 'Handbags', 'Belts', 'Wallets'],
      },
      {
        id: 'subcat-suede',
        name: 'Suede',
        slug: 'suede',
        description: 'Velvety napped leather crafted from the inner soft underside of animal hide.',
        characteristics: ['Velvety soft nap', 'Pliable & warm', 'Absorbent finish', 'Tactile luxurious hand'],
        commonApplications: ['Loafers & Boots', 'Suede Jackets', 'Designer Handbags'],
      },
      {
        id: 'subcat-nubuck',
        name: 'Nubuck',
        slug: 'nubuck',
        description: 'Top-grain leather lightly buffed on the exterior to create a fine, durable velvet-like nap.',
        characteristics: ['Tougher than suede', 'Fine short nap', 'Premium feel', 'Resilient outer hide'],
        commonApplications: ['Work Boots', 'Premium Sneakers', 'Outerwear Accessories'],
      },
    ],
  },

  // 3. Synthetic (Man-Made) Fabrics
  {
    id: 'cat-polyester',
    name: 'Polyester',
    slug: 'polyester',
    mainFamily: 'Synthetic (Man-Made) Fabrics',
    description: 'Petroleum-based polymer textile valued for wrinkle resistance, quick drying times, and high durability.',
    image: 'https://images.pexels.com/photos/10221755/pexels-photo-10221755.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-pet-polyester',
        name: 'PET Polyester',
        slug: 'pet-polyester',
        description: 'Polyethylene Terephthalate — the most ubiquitous synthetic fiber, lightweight, strong, and shrink-proof.',
        characteristics: ['Zero wrinkle retention', 'Fast drying', 'High tensile strength', 'Holds permanent pleats'],
        commonApplications: ['Sportswear', 'Outwear Linings', 'Industrial Textiles', 'Banners'],
      },
      {
        id: 'subcat-pcdt-polyester',
        name: 'PCDT Polyester',
        slug: 'pcdt-polyester',
        description: 'Poly-1,4-cyclohexylene-dimethylene terephthalate offering higher elasticity and pill resistance.',
        characteristics: ['Higher elasticity', 'Pill resistant', 'Softer hand feel', 'Durable for heavy wear'],
        commonApplications: ['Heavy Upholstery', 'Curtains', 'Suit Linings'],
      },
      {
        id: 'subcat-microfiber',
        name: 'Microfiber',
        slug: 'microfiber',
        description: 'Ultra-fine synthetic filaments (<1 denier) split to trap dust and moisture with extreme softness.',
        characteristics: ['Traps dust & moisture', 'Liquid repelling or absorbing', 'Ultra-lightweight', 'Lint free'],
        commonApplications: ['Athletic Shirts', 'Cleaning Cloths', 'Waterproof Jackets'],
      },
    ],
  },
  {
    id: 'cat-nylon',
    name: 'Nylon',
    slug: 'nylon',
    mainFamily: 'Synthetic (Man-Made) Fabrics',
    description: 'Exceptionally strong polyamide fiber with superior elasticity, abrasion resistance, and chemical stability.',
    image: 'https://images.pexels.com/photos/13895319/pexels-photo-13895319.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-nylon-66',
        name: 'Nylon 6,6',
        slug: 'nylon-66',
        description: 'High-performance crystalline nylon offering maximum melting point, stiffness, and tear strength.',
        characteristics: ['Extreme tear strength', 'High melting point', 'Chemical resistant', 'Smooth glide finish'],
        commonApplications: ['Parachutes', 'Activewear', 'Swimwear', 'Hosiery'],
      },
      {
        id: 'subcat-ripstop-nylon',
        name: 'Ripstop Nylon',
        slug: 'ripstop-nylon',
        description: 'Woven nylon fabric with crosshatch reinforcement threads preventing tears from spreading.',
        characteristics: ['Tear-proof crosshatch', 'Lightweight GSM', 'Water-repellent treatment', 'Wind blocking'],
        commonApplications: ['Camping Tents', 'Kites', 'Windbreakers', 'Sleeping Bags'],
      },
      {
        id: 'subcat-ballistic-nylon',
        name: 'Ballistic Nylon',
        slug: 'ballistic-nylon',
        description: 'Thick 2x2 basketweave nylon originally developed for military flak jackets with high puncture resistance.',
        characteristics: ['Puncture & tear proof', 'Heavy denier (840D-1680D)', 'Rugged texture', 'Industrial grade'],
        commonApplications: ['Luggage & Suitcases', 'Tool Belts', 'Motorcycle Jackets'],
      },
    ],
  },
  {
    id: 'cat-spandex',
    name: 'Spandex (Elastane)',
    slug: 'spandex',
    mainFamily: 'Synthetic (Man-Made) Fabrics',
    description: 'Polyurethane elasticity fiber capable of stretching up to 500% without losing shape recovery.',
    image: 'https://images.pexels.com/photos/11871841/pexels-photo-11871841.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-lycra',
        name: 'Lycra',
        slug: 'lycra',
        description: 'The premier trademarked elastane fiber known for exceptional 4-way stretch and shape retention.',
        characteristics: ['500% stretch recovery', 'Shape memory', 'Chlorine resistant', 'Form fitting'],
        commonApplications: ['Swimwear', 'Performance Leggings', 'Cycle Jerseys'],
      },
      {
        id: 'subcat-elastane',
        name: 'Elastane',
        slug: 'elastane',
        description: 'Generic polyurethane elastomeric fiber blended into woven and knit textiles for flex comfort.',
        characteristics: ['Flex comfort', 'Prevents garment bagging', 'Blends easily with cotton/wool'],
        commonApplications: ['Stretch Jeans', 'Fitted Shirts', 'Socks'],
      },
      {
        id: 'subcat-roica',
        name: 'Roica',
        slug: 'roica',
        description: 'Eco-designed sustainable stretch elastane fiber with recycled content and degradation options.',
        characteristics: ['Recycled stretch option', 'Odor neutralising', 'High heat setting stability'],
        commonApplications: ['Eco Activewear', 'Sustainable Underwear'],
      },
    ],
  },
  {
    id: 'cat-neoprene',
    name: 'Neoprene',
    slug: 'neoprene',
    mainFamily: 'Synthetic (Man-Made) Fabrics',
    description: 'Synthetic rubber polymer filled with nitrogen bubbles providing thermal insulation and shock absorption.',
    image: 'https://images.pexels.com/photos/1516259/pexels-photo-1516259.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-closed-cell-neoprene',
        name: 'Closed-Cell Neoprene',
        slug: 'closed-cell-neoprene',
        description: 'Impenetrable rubber cells trapping gas bubbles for 100% waterproof insulation and buoyancy.',
        characteristics: ['100% Waterproof', 'Buoyant in water', 'Thermal insulator', 'Cushioned impact'],
        commonApplications: ['Diving Wetsuits', 'Laptop Sleeves', 'Orthopedic Braces'],
      },
      {
        id: 'subcat-open-cell-neoprene',
        name: 'Open-Cell Neoprene',
        slug: 'open-cell-neoprene',
        description: 'Flexible rubber matrix that suction-grips skin to trap a warm microscopic layer of water.',
        characteristics: ['Suction grip on skin', 'Ultra flexible', 'Superior warmth-to-thickness'],
        commonApplications: ['Spearfishing Wetsuits', 'Professional Cold Water Gear'],
      },
    ],
  },

  // 4. Semi-Synthetic (Cellulose) Fabrics
  {
    id: 'cat-rayon',
    name: 'Rayon (Viscose)',
    slug: 'rayon',
    mainFamily: 'Semi-Synthetic (Cellulose) Fabrics',
    description: 'Reconstituted wood pulp cellulose creating silk-like draping textiles with high breathability.',
    image: 'https://images.pexels.com/photos/7640758/pexels-photo-7640758.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-viscose',
        name: 'Viscose',
        slug: 'viscose',
        description: 'The primary form of rayon with fluid drape, silky lustre, and high absorbency.',
        characteristics: ['Silky lustrous drape', 'Highly absorbent', 'Breathable cool feel', 'Vibrant dye affinity'],
        commonApplications: ['Summer Dresses', 'Blouses', 'Lining Fabrics', 'Scarves'],
      },
      {
        id: 'subcat-modal',
        name: 'Modal',
        slug: 'modal',
        description: 'High wet-modulus cellulose extracted from beech trees, staying soft after repeated laundering.',
        characteristics: ['Resists hard water fading', 'Ultra-soft hand feel', 'Does not shrink', 'Absorbent'],
        commonApplications: ['Luxury Underwear', 'Sleepwear', 'T-Shirts', 'Towels'],
      },
      {
        id: 'subcat-cupro',
        name: 'Cupro',
        slug: 'cupro',
        description: 'Regenerated cellulose from cotton linter waste, featuring a heavy silk-like touch and hypoallergenic feel.',
        characteristics: ['Heavy silk hand', 'Hypoallergenic', 'Static free', 'Breathable luxury lining'],
        commonApplications: ['Suit Linings', 'Luxury Evening Wear', 'Draped Skirts'],
      },
    ],
  },
  {
    id: 'cat-lyocell',
    name: 'Lyocell',
    slug: 'lyocell',
    mainFamily: 'Semi-Synthetic (Cellulose) Fabrics',
    description: 'Sustainable closed-loop cellulose fiber derived from sustainably harvested eucalyptus trees.',
    image: 'https://images.pexels.com/photos/6276010/pexels-photo-6276010.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-generic-lyocell',
        name: 'Generic Lyocell',
        slug: 'generic-lyocell',
        description: 'Eco-processed cellulose with high dry and wet strength, smooth texture, and bio-degradability.',
        characteristics: ['Biodegradable', 'High wet strength', 'Moisture management', 'Wrinkle resistant'],
        commonApplications: ['Casual Apparel', 'Work Shirting', 'Home Textiles'],
      },
      {
        id: 'subcat-tencel',
        name: 'Tencel',
        slug: 'tencel',
        description: 'Premium Lenzing-certified lyocell manufactured using 99.8% recycled organic solvent.',
        characteristics: ['99.8% Closed loop solvent', 'Silky smooth surface', 'Inhibits bacterial growth'],
        commonApplications: ['Sustainable Denim', 'Luxury Shirts', 'Bedding Sheets'],
      },
    ],
  },
  {
    id: 'cat-acetate',
    name: 'Acetate',
    slug: 'acetate',
    mainFamily: 'Semi-Synthetic (Cellulose) Fabrics',
    description: 'Cellulose acetate polymer producing crisp, lustrous fabrics resistant to pilling and static.',
    image: 'https://images.pexels.com/photos/4863003/pexels-photo-4863003.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-diacetate',
        name: 'Diacetate',
        slug: 'diacetate',
        description: 'Standard acetate filament with high gloss and crisp drape, popular for lining garments.',
        characteristics: ['High gloss shine', 'Crisp body', 'Static free', 'Fast drying'],
        commonApplications: ['Jacket Linings', 'Party Wear', 'Ribbons'],
      },
      {
        id: 'subcat-triacetate',
        name: 'Triacetate',
        slug: 'triacetate',
        description: 'Heat-set modified acetate capable of retaining permanent sharp pleats and resisting wrinkles.',
        characteristics: ['Permanent pleat retention', 'Wrinkle proof', 'Machine washable', 'Crisp drape'],
        commonApplications: ['Pleated Skirts', 'Gowns', 'Formal Trousers'],
      },
    ],
  },

  // 5. Fabric Weaves and Styles
  {
    id: 'cat-denim',
    name: 'Denim',
    slug: 'denim',
    mainFamily: 'Fabric Weaves and Styles',
    description: 'Rugged cotton twill weave characterized by indigo-dyed warp threads and un-dyed white weft threads.',
    image: 'https://images.pexels.com/photos/10912871/pexels-photo-10912871.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-raw-denim',
        name: 'Raw Denim',
        slug: 'raw-denim',
        description: 'Unwashed, untreated stiff denim straight from the loom that molds to the wearer over time.',
        characteristics: ['Stiff unwashed finish', 'Custom fade patina', 'High durability', '100% Cotton twill'],
        commonApplications: ['Heritage Jeans', 'Denim Jackets', 'Work Aprons'],
      },
      {
        id: 'subcat-selvedge-denim',
        name: 'Selvedge Denim',
        slug: 'selvedge-denim',
        description: 'Woven on traditional shuttle looms creating clean, tightly bound self-edges with iconic contrast ID thread.',
        characteristics: ['Shuttle loom edge', 'Prevents unraveling', 'Heavyweight GSM', 'Collector quality'],
        commonApplications: ['Premium Jeans', 'Bespoke Workwear Jackets'],
      },
      {
        id: 'subcat-stretch-denim',
        name: 'Stretch Denim',
        slug: 'stretch-denim',
        description: 'Indigo twill incorporating 1-3% elastane for modern mobility and shape-retaining comfort.',
        characteristics: ['Comfort mobility', 'Shape retention', 'Slight flex', 'Soft washed feel'],
        commonApplications: ['Slim-Fit Jeans', 'Denim Shirts', 'Skirts'],
      },
    ],
  },
  {
    id: 'cat-satin',
    name: 'Satin',
    slug: 'satin',
    mainFamily: 'Fabric Weaves and Styles',
    description: 'Weave technique featuring floating warp threads producing a highly lustrous face and smooth back.',
    image: 'https://images.pexels.com/photos/21926654/pexels-photo-21926654.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-crepe-back-satin',
        name: 'Crepe-back Satin',
        slug: 'crepe-back-satin',
        description: 'Reversible fabric with a glossy satin top face and a pebbled matte crepe reverse side.',
        characteristics: ['Reversible shiny/matte', 'Fluid heavy drape', 'Rich depth of color'],
        commonApplications: ['Evening Gowns', 'Bridal Wear', 'Couture Dresses'],
      },
      {
        id: 'subcat-duchesse-satin',
        name: 'Duchesse Satin',
        slug: 'duchesse-satin',
        description: 'Heavyweight, crisp satin weave with low sheen and rich structural volume for bridal couture.',
        characteristics: ['Structural firmness', 'Low elegant sheen', 'Heavy GSM', 'Sculptural body'],
        commonApplications: ['Bridal Ballgowns', 'Formal Corsets', 'Evening Skirts'],
      },
      {
        id: 'subcat-charmeuse-satin',
        name: 'Charmeuse Satin',
        slug: 'charmeuse-satin',
        description: 'Lightweight fluid satin weave offering high shine and liquid drape over body contours.',
        characteristics: ['High mirror shine', 'Liquid drape', 'Lightweight', 'Soft touch'],
        commonApplications: ['Lingerie', 'Fluid Blouses', 'Slip Dresses'],
      },
    ],
  },
  {
    id: 'cat-velvet',
    name: 'Velvet',
    slug: 'velvet',
    mainFamily: 'Fabric Weaves and Styles',
    description: 'Tufted woven fabric with evenly cut short pile threads giving an opulent soft tactile nap.',
    image: 'https://images.pexels.com/photos/31209268/pexels-photo-31209268.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-crushed-velvet',
        name: 'Crushed Velvet',
        slug: 'crushed-velvet',
        description: 'Velvet pile mechanically twisted and pressed in various directions for shimmering light catch.',
        characteristics: ['Multidirectional shimmer', 'Textured nap', 'Vintage glam aesthetic'],
        commonApplications: ['Statement Jackets', 'Upholstery Pillows', 'Dramatic Dresses'],
      },
      {
        id: 'subcat-panne-velvet',
        name: 'Panne Velvet',
        slug: 'panne-velvet',
        description: 'Lightweight stretch velvet with pile flattened in a single direction for high sheen catch.',
        characteristics: ['Flat directional pile', 'High stretch', 'Lightweight GSM', 'Glossy shimmer'],
        commonApplications: ['Dancewear', 'Stretch Tops', 'Costumes'],
      },
      {
        id: 'subcat-silk-velvet',
        name: 'Silk Velvet',
        slug: 'silk-velvet',
        description: 'The pinnacle of luxury velvet featuring a silk backing base and soft rayon/silk pile.',
        characteristics: ['Liquid draping softness', 'Deep rich depth', 'Opulent lustre'],
        commonApplications: ['Haute Couture Gowns', 'Luxury Capes', 'Evening Wraps'],
      },
      {
        id: 'subcat-cotton-velvet',
        name: 'Cotton Velvet',
        slug: 'cotton-velvet',
        description: 'Dense matte pile cotton velvet with sturdy structural body and high wear durability.',
        characteristics: ['Matte deep finish', 'Sturdy structure', 'High abrasion rating', 'Rich color saturation'],
        commonApplications: ['Interior Upholstery', 'Tailored Blazers', 'Heavy Curtains'],
      },
    ],
  },
  {
    id: 'cat-chiffon',
    name: 'Chiffon',
    slug: 'chiffon',
    mainFamily: 'Fabric Weaves and Styles',
    description: 'Lightweight plain-weave sheer fabric crafted with tightly twisted crepe yarns for delicate floaty drape.',
    image: 'https://images.pexels.com/photos/33264441/pexels-photo-33264441.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-silk-chiffon',
        name: 'Silk Chiffon',
        slug: 'silk-chiffon',
        description: 'Ultra-luxurious sheer silk fabric with natural soft drape, slight puckered texture, and matte transparency.',
        characteristics: ['100% Sheer transparency', 'Natural spring & drape', 'Soft hand feel', 'Breathable'],
        commonApplications: ['Evening Overlays', 'Bridal Veils', 'Scarves', 'Flowy Sleeves'],
      },
      {
        id: 'subcat-polyester-chiffon',
        name: 'Polyester Chiffon',
        slug: 'polyester-chiffon',
        description: 'Durable and snag-resistant synthetic sheer chiffon that is machine-washable and budget-friendly.',
        characteristics: ['Wrinkle resistant', 'Machine washable', 'Colorfast', 'Economic sheer option'],
        commonApplications: ['Bridesmaid Dresses', 'Dance Wear', 'Layered Skirts'],
      },
      {
        id: 'subcat-crepe-chiffon',
        name: 'Crepe Chiffon',
        slug: 'crepe-chiffon',
        description: 'Textured sheer fabric with high-twist crepe yarns providing a pronounced pebbled surface.',
        characteristics: ['Pebbled crepe texture', 'Non-slip handling', 'Graceful fluid drape'],
        commonApplications: ['Blouses', 'Pleated Scarves', 'Formal Overlays'],
      },
    ],
  },
  {
    id: 'cat-corduroy',
    name: 'Corduroy',
    slug: 'corduroy',
    mainFamily: 'Fabric Weaves and Styles',
    description: 'Durable cotton textile featuring raised parallel velvety ridges (wales) running vertically.',
    image: 'https://images.pexels.com/photos/6843265/pexels-photo-6843265.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-standard-wale-corduroy',
        name: 'Standard Wale Corduroy',
        slug: 'standard-wale-corduroy',
        description: 'Classic 10-12 wales per inch corduroy balancing warmth, texture, and structural tailoring.',
        characteristics: ['10-12 wales per inch', 'Warm insulator', 'Durable cotton pile', 'Tactile ridges'],
        commonApplications: ['Corduroy Pants', 'Casual Blazers', 'Overshirts'],
      },
      {
        id: 'subcat-pinwale',
        name: 'Pinwale (Pincord)',
        slug: 'pinwale',
        description: 'Ultra-fine corduroy with 16-21 thin ribs per inch offering soft drape and subtle ribbed texture.',
        characteristics: ['16-21 fine ribs per inch', 'Lightweight GSM', 'Soft flexible drape', 'Subtle texture'],
        commonApplications: ['Childrenswear', 'Fitted Shirts', 'Dresses', 'Caps'],
      },
      {
        id: 'subcat-elephant-cord',
        name: 'Elephant Cord',
        slug: 'elephant-cord',
        description: 'Heavyweight corduroy with wide, thick ribs (3-6 wales per inch) for maximum thermal warmth and rugged style.',
        characteristics: ['3-6 wide thick ribs', 'Heavyweight GSM (380+)', 'Maximum warmth', 'Rugged vintage look'],
        commonApplications: ['Winter Overcoats', 'Heavy Upholstery', 'Rugged Pants'],
      },
    ],
  },
  {
    id: 'cat-damask',
    name: 'Damask',
    slug: 'damask',
    mainFamily: 'Fabric Weaves and Styles',
    description: 'Reversible figured jacquard fabric where the pattern is created through alternating satin and sateen weaves.',
    image: 'https://images.pexels.com/photos/7946566/pexels-photo-7946566.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    subcategories: [
      {
        id: 'subcat-silk-damask',
        name: 'Silk Damask',
        slug: 'silk-damask',
        description: 'Opulent heirloom silk jacquard fabric with lustrous botanical or baroque motifs woven into the fabric structure.',
        characteristics: ['Reversible satin pattern', 'Opulent sheen contrast', 'Heritage craftsmanship', 'Heavy rich drape'],
        commonApplications: ['Luxury Upholstery', 'Formal Evening Wear', 'Historic Costumes', 'Wallcoverings'],
      },
      {
        id: 'subcat-cotton-damask',
        name: 'Cotton Damask',
        slug: 'cotton-damask',
        description: 'Durable Mercerized cotton damask with subtle shine and crisp body for dining and hotel textiles.',
        characteristics: ['Mercerized crisp sheen', 'High wash resistance', 'Reversible pattern', 'Formal weight'],
        commonApplications: ['Tablecloths', 'Bedspreads', 'Curtains'],
      },
      {
        id: 'subcat-synthetic-damask',
        name: 'Synthetic Damask',
        slug: 'synthetic-damask',
        description: 'Stain-resistant polyester/blend damask engineered for high-traffic commercial hospitality use.',
        characteristics: ['Stain repellent', 'Wrinkle proof', 'Commercial laundry safe', 'Budget friendly'],
        commonApplications: ['Banquet Linens', 'Hotel Drapes', 'Event Covers'],
      },
    ],
  },
];

export const MAIN_FABRIC_FAMILIES = [
  'Natural Plant-Based Fabrics',
  'Natural Animal-Based Fabrics',
  'Synthetic (Man-Made) Fabrics',
  'Semi-Synthetic (Cellulose) Fabrics',
  'Fabric Weaves and Styles',
] as const;

export function getAllSubcategories() {
  const subcats: FabricSubcategoryDef[] = [];
  for (const cat of FABRIC_TAXONOMY) {
    subcats.push(...cat.subcategories);
  }
  return subcats;
}

export function findSubcategoryById(id: string): FabricSubcategoryDef | undefined {
  for (const cat of FABRIC_TAXONOMY) {
    const found = cat.subcategories.find((s) => s.id === id || s.slug === id);
    if (found) return found;
  }
  return undefined;
}

export function findCategoryBySubcategoryId(subcategoryId: string): FabricCategoryDef | undefined {
  for (const cat of FABRIC_TAXONOMY) {
    if (cat.subcategories.some((s) => s.id === subcategoryId || s.slug === subcategoryId)) {
      return cat;
    }
  }
  return undefined;
}
