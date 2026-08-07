import { FABRIC_TAXONOMY } from "./taxonomyData";
import { Product, Category, Subcategory } from "../types";

export function getTaxonomyCategories(): Category[] {
  return FABRIC_TAXONOMY.map((cat, idx) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    mainFamily: cat.mainFamily,
    description: cat.description,
    image: cat.image,
    fabricCount: cat.subcategories.length * 3 + 2,
    status: "ENABLED",
    sortOrder: idx + 1,
    subcategories: cat.subcategories.map((sub) => ({
      id: sub.id,
      categoryId: cat.id,
      categoryName: cat.name,
      mainFamily: cat.mainFamily,
      name: sub.name,
      slug: sub.slug,
      description: sub.description,
      characteristics: sub.characteristics,
      commonApplications: sub.commonApplications,
    })),
  }));
}

export function getAllTaxonomySubcategories(): Subcategory[] {
  const list: Subcategory[] = [];
  for (const cat of FABRIC_TAXONOMY) {
    for (const sub of cat.subcategories) {
      list.push({
        id: sub.id,
        categoryId: cat.id,
        categoryName: cat.name,
        mainFamily: cat.mainFamily,
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        characteristics: sub.characteristics,
        commonApplications: sub.commonApplications,
      });
    }
  }
  return list;
}

const SUPPLIERS_REF = [
  { id: "user-supplier-1", name: "Apex Textiles Ltd.", slug: "apex-textiles", logo: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400" },
  { id: "user-supplier-2", name: "Global Looms Inc.", slug: "global-looms", logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150" },
  { id: "user-supplier-3", name: "SynthoTech Fabrics", slug: "synthotech-fabrics", logo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
];

const SUB_IMAGES_MAP: Record<string, string[]> = {
  "upland-cotton": [
    "https://images.pexels.com/photos/6292/blue-pattern-texture-macro.jpg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/36346049/pexels-photo-36346049.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/18372335/pexels-photo-18372335.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/13368318/pexels-photo-13368318.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "egyptian-cotton": [
    "https://images.pexels.com/photos/36013228/pexels-photo-36013228.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/8817549/pexels-photo-8817549.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7640926/pexels-photo-7640926.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34860677/pexels-photo-34860677.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "pima-cotton": [
    "https://images.pexels.com/photos/7640902/pexels-photo-7640902.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/30958986/pexels-photo-30958986.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7533977/pexels-photo-7533977.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7988099/pexels-photo-7988099.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "organic-cotton": [
    "https://images.pexels.com/photos/7533973/pexels-photo-7533973.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7598534/pexels-photo-7598534.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7794365/pexels-photo-7794365.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34860673/pexels-photo-34860673.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "damask-linen": [
    "https://images.pexels.com/photos/7533979/pexels-photo-7533979.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7232409/pexels-photo-7232409.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34860699/pexels-photo-34860699.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34851001/pexels-photo-34851001.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "plain-woven-linen": [
    "https://images.pexels.com/photos/7794364/pexels-photo-7794364.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/4554339/pexels-photo-4554339.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/14827011/pexels-photo-14827011.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7640869/pexels-photo-7640869.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "loosely-woven-linen": [
    "https://images.pexels.com/photos/8774406/pexels-photo-8774406.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6850552/pexels-photo-6850552.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/36013453/pexels-photo-36013453.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7988109/pexels-photo-7988109.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "sheeting-linen": [
    "https://images.pexels.com/photos/7946560/pexels-photo-7946560.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7790155/pexels-photo-7790155.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7087670/pexels-photo-7087670.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6843278/pexels-photo-6843278.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "hemp-canvas": [
    "https://images.pexels.com/photos/7605099/pexels-photo-7605099.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7598537/pexels-photo-7598537.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6239867/pexels-photo-6239867.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/9756327/pexels-photo-9756327.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "hemp-linen": [
    "https://images.pexels.com/photos/15429343/pexels-photo-15429343.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34860704/pexels-photo-34860704.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6044416/pexels-photo-6044416.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/15391107/pexels-photo-15391107.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "hemp-jersey": [
    "https://images.pexels.com/photos/10221752/pexels-photo-10221752.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/27644245/pexels-photo-27644245.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/10221741/pexels-photo-10221741.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/1487692/pexels-photo-1487692.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "bamboo-viscose": [
    "https://images.pexels.com/photos/6594391/pexels-photo-6594391.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6634461/pexels-photo-6634461.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/36319637/pexels-photo-36319637.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/24778960/pexels-photo-24778960.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "bamboo-lyocell": [
    "https://images.pexels.com/photos/7232500/pexels-photo-7232500.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/36319630/pexels-photo-36319630.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/10838980/pexels-photo-10838980.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/37955248/pexels-photo-37955248.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "bamboo-linen": [
    "https://images.pexels.com/photos/34860701/pexels-photo-34860701.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34850988/pexels-photo-34850988.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1587032039356-a62ad49deaa2?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8M3x8QmFtYm9vJTIwTGluZW4lMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg0OHww&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1701292156068-6c52a04ffe35?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8NHx8QmFtYm9vJTIwTGluZW4lMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg0OHww&ixlib=rb-4.1.0"
  ],
  "duck-canvas": [
    "https://images.pexels.com/photos/29060166/pexels-photo-29060166.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/11871839/pexels-photo-11871839.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/33944144/pexels-photo-33944144.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34860672/pexels-photo-34860672.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "plain-canvas": [
    "https://images.pexels.com/photos/11255290/pexels-photo-11255290.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7794357/pexels-photo-7794357.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/18372331/pexels-photo-18372331.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7641149/pexels-photo-7641149.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "merino-wool": [
    "https://images.pexels.com/photos/6634556/pexels-photo-6634556.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/10221760/pexels-photo-10221760.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/32984627/pexels-photo-32984627.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6276068/pexels-photo-6276068.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "cashmere": [
    "https://images.pexels.com/photos/19203177/pexels-photo-19203177.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/33980190/pexels-photo-33980190.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/9173523/pexels-photo-9173523.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6630897/pexels-photo-6630897.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "alpaca-wool": [
    "https://images.pexels.com/photos/32655894/pexels-photo-32655894.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/32655889/pexels-photo-32655889.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6634567/pexels-photo-6634567.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/15546844/pexels-photo-15546844.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "mohair": [
    "https://images.pexels.com/photos/36288028/pexels-photo-36288028.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/37955302/pexels-photo-37955302.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/31853353/pexels-photo-31853353.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/35150386/pexels-photo-35150386.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "angora": [
    "https://images.pexels.com/photos/35993315/pexels-photo-35993315.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6276063/pexels-photo-6276063.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1783366548984-90ec4ef88078?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8QW5nb3JhJTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4NTR8MA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1701292156068-6c52a04ffe35?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8Mnx8QW5nb3JhJTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4NTR8MA&ixlib=rb-4.1.0"
  ],
  "mulberry-silk": [
    "https://images.pexels.com/photos/18877232/pexels-photo-18877232.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6875101/pexels-photo-6875101.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/1487809/pexels-photo-1487809.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/10317127/pexels-photo-10317127.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "tussah-silk": [
    "https://images.pexels.com/photos/459486/pexels-photo-459486.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/36299788/pexels-photo-36299788.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/365067/pexels-photo-365067.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/413676/pexels-photo-413676.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "charmeuse": [
    "https://images.pexels.com/photos/34850984/pexels-photo-34850984.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34860700/pexels-photo-34860700.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7232402/pexels-photo-7232402.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/4878204/pexels-photo-4878204.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "dupioni": [
    "https://images.pexels.com/photos/36346080/pexels-photo-36346080.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/10328901/pexels-photo-10328901.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6634449/pexels-photo-6634449.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34154437/pexels-photo-34154437.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "full-grain-leather": [
    "https://images.pexels.com/photos/34860667/pexels-photo-34860667.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34850987/pexels-photo-34850987.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34860708/pexels-photo-34860708.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34851014/pexels-photo-34851014.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "top-grain-leather": [
    "https://images.pexels.com/photos/34860669/pexels-photo-34860669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34850999/pexels-photo-34850999.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34851019/pexels-photo-34851019.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34851013/pexels-photo-34851013.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "suede": [
    "https://images.pexels.com/photos/16659340/pexels-photo-16659340.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/32858235/pexels-photo-32858235.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/11255289/pexels-photo-11255289.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/13717230/pexels-photo-13717230.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "nubuck": [
    "https://images.pexels.com/photos/36053323/pexels-photo-36053323.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1650406268594-c5d310f6fbce?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8TnVidWNrJTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4NjF8MA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1593016836274-72b5cca2d7cc?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8Mnx8TnVidWNrJTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4NjF8MA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1650406268584-8903e4362868?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8M3x8TnVidWNrJTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4NjF8MA&ixlib=rb-4.1.0"
  ],
  "pet-polyester": [
    "https://images.pexels.com/photos/10221755/pexels-photo-10221755.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7598388/pexels-photo-7598388.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/4862874/pexels-photo-4862874.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/8893906/pexels-photo-8893906.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "pcdt-polyester": [
    "https://images.pexels.com/photos/6979813/pexels-photo-6979813.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/15076731/pexels-photo-15076731.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/36299791/pexels-photo-36299791.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/19856118/pexels-photo-19856118.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "microfiber": [
    "https://images.pexels.com/photos/4862952/pexels-photo-4862952.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7641223/pexels-photo-7641223.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/36346068/pexels-photo-36346068.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1650406268594-c5d310f6fbce?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8TWljcm9maWJlciUyMGZhYnJpYyUyMHRleHR1cmUlMjB3ZWF2ZXxlbnwwfDJ8fHwxNzg2MTA1ODY0fDA&ixlib=rb-4.1.0"
  ],
  "nylon-66": [
    "https://images.pexels.com/photos/24506111/pexels-photo-24506111.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7598538/pexels-photo-7598538.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/37955290/pexels-photo-37955290.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/12957620/pexels-photo-12957620.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "ripstop-nylon": [
    "https://images.pexels.com/photos/13895319/pexels-photo-13895319.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/28370847/pexels-photo-28370847.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/33425495/pexels-photo-33425495.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/36319654/pexels-photo-36319654.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "ballistic-nylon": [
    "https://images.pexels.com/photos/8893905/pexels-photo-8893905.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1650406268594-c5d310f6fbce?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8QmFsbGlzdGljJTIwTnlsb24lMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg2Nnww&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1650406264829-baf4f242a4de?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8Mnx8QmFsbGlzdGljJTIwTnlsb24lMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg2Nnww&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1782773514890-b5f1ceb38c1a?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8M3x8QmFsbGlzdGljJTIwTnlsb24lMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg2Nnww&ixlib=rb-4.1.0"
  ],
  "lycra": [
    "https://images.pexels.com/photos/11871841/pexels-photo-11871841.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/19203176/pexels-photo-19203176.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6276020/pexels-photo-6276020.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1650406268594-c5d310f6fbce?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8THljcmElMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg2N3ww&ixlib=rb-4.1.0"
  ],
  "elastane": [
    "https://images.unsplash.com/photo-1650406268594-c5d310f6fbce?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8RWxhc3RhbmUlMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg2OXww&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1650406264829-baf4f242a4de?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8Mnx8RWxhc3RhbmUlMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg2OXww&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1676524246728-bda8b4c0548a?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8NHx8RWxhc3RhbmUlMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg2OXww&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1695911053184-2a6bc67b3b99?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8NXx8RWxhc3RhbmUlMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg2OXww&ixlib=rb-4.1.0"
  ],
  "roica": [
    "https://images.pexels.com/photos/37722685/pexels-photo-37722685.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/36299785/pexels-photo-36299785.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/36033692/pexels-photo-36033692.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/4862958/pexels-photo-4862958.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "closed-cell-neoprene": [
    "https://images.pexels.com/photos/1516259/pexels-photo-1516259.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1650406268594-c5d310f6fbce?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8Q2xvc2VkLUNlbGwlMjBOZW9wcmVuZSUyMGZhYnJpYyUyMHRleHR1cmUlMjB3ZWF2ZXxlbnwwfDJ8fHwxNzg2MTA1ODcyfDA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1782773514890-b5f1ceb38c1a?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8Mnx8Q2xvc2VkLUNlbGwlMjBOZW9wcmVuZSUyMGZhYnJpYyUyMHRleHR1cmUlMjB3ZWF2ZXxlbnwwfDJ8fHwxNzg2MTA1ODcyfDA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1698043649093-05c5d835f290?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8OHx8Q2xvc2VkLUNlbGwlMjBOZW9wcmVuZSUyMGZhYnJpYyUyMHRleHR1cmUlMjB3ZWF2ZXxlbnwwfDJ8fHwxNzg2MTA1ODcyfDA&ixlib=rb-4.1.0"
  ],
  "open-cell-neoprene": [
    "https://images.pexels.com/photos/10221758/pexels-photo-10221758.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1650406268594-c5d310f6fbce?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8T3Blbi1DZWxsJTIwTmVvcHJlbmUlMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg3M3ww&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1782773514890-b5f1ceb38c1a?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8Mnx8T3Blbi1DZWxsJTIwTmVvcHJlbmUlMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg3M3ww&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1684750360713-2fca0fed4a0a?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8NXx8T3Blbi1DZWxsJTIwTmVvcHJlbmUlMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg3M3ww&ixlib=rb-4.1.0"
  ],
  "viscose": [
    "https://images.pexels.com/photos/7640758/pexels-photo-7640758.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1650406268594-c5d310f6fbce?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8VmlzY29zZSUyMGZhYnJpYyUyMHRleHR1cmUlMjB3ZWF2ZXxlbnwwfDJ8fHwxNzg2MTA1ODc1fDA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1650406264829-baf4f242a4de?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8Mnx8VmlzY29zZSUyMGZhYnJpYyUyMHRleHR1cmUlMjB3ZWF2ZXxlbnwwfDJ8fHwxNzg2MTA1ODc1fDA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1602913268078-f740e8fa7ac5?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8M3x8VmlzY29zZSUyMGZhYnJpYyUyMHRleHR1cmUlMjB3ZWF2ZXxlbnwwfDJ8fHwxNzg2MTA1ODc1fDA&ixlib=rb-4.1.0"
  ],
  "modal": [
    "https://images.pexels.com/photos/4862895/pexels-photo-4862895.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/1475032/pexels-photo-1475032.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1650406268594-c5d310f6fbce?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8TW9kYWwlMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg3Nnww&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1650406264829-baf4f242a4de?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8Mnx8TW9kYWwlMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg3Nnww&ixlib=rb-4.1.0"
  ],
  "cupro": [
    "https://images.pexels.com/photos/4863003/pexels-photo-4863003.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/1487834/pexels-photo-1487834.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/36299795/pexels-photo-36299795.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7946638/pexels-photo-7946638.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "generic-lyocell": [
    "https://images.pexels.com/photos/6276010/pexels-photo-6276010.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/9547837/pexels-photo-9547837.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1650406268594-c5d310f6fbce?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8R2VuZXJpYyUyMEx5b2NlbGwlMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg3OXww&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1602913268078-f740e8fa7ac5?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8Mnx8R2VuZXJpYyUyMEx5b2NlbGwlMjBmYWJyaWMlMjB0ZXh0dXJlJTIwd2VhdmV8ZW58MHwyfHx8MTc4NjEwNTg3OXww&ixlib=rb-4.1.0"
  ],
  "tencel": [
    "https://images.unsplash.com/photo-1650406268594-c5d310f6fbce?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8VGVuY2VsJTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4ODB8MA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1650406264829-baf4f242a4de?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8Mnx8VGVuY2VsJTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4ODB8MA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1602913268078-f740e8fa7ac5?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8NHx8VGVuY2VsJTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4ODB8MA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1695911053184-2a6bc67b3b99?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8NXx8VGVuY2VsJTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4ODB8MA&ixlib=rb-4.1.0"
  ],
  "diacetate": [
    "https://images.unsplash.com/photo-1695911053146-0a0620c5c46e?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8Mnx8RGlhY2V0YXRlJTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4ODJ8MA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1695911053184-2a6bc67b3b99?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8M3x8RGlhY2V0YXRlJTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4ODJ8MA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1704120714992-7bd80be39018?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8N3x8RGlhY2V0YXRlJTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4ODJ8MA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1684750360713-2fca0fed4a0a?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8OHx8RGlhY2V0YXRlJTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4ODJ8MA&ixlib=rb-4.1.0"
  ],
  "triacetate": [
    "https://images.unsplash.com/photo-1650406268594-c5d310f6fbce?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8VHJpYWNldGF0ZSUyMGZhYnJpYyUyMHRleHR1cmUlMjB3ZWF2ZXxlbnwwfDJ8fHwxNzg2MTA1ODgzfDA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1650406264829-baf4f242a4de?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8Mnx8VHJpYWNldGF0ZSUyMGZhYnJpYyUyMHRleHR1cmUlMjB3ZWF2ZXxlbnwwfDJ8fHwxNzg2MTA1ODgzfDA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1602913268078-f740e8fa7ac5?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8M3x8VHJpYWNldGF0ZSUyMGZhYnJpYyUyMHRleHR1cmUlMjB3ZWF2ZXxlbnwwfDJ8fHwxNzg2MTA1ODgzfDA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1695911053184-2a6bc67b3b99?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8NXx8VHJpYWNldGF0ZSUyMGZhYnJpYyUyMHRleHR1cmUlMjB3ZWF2ZXxlbnwwfDJ8fHwxNzg2MTA1ODgzfDA&ixlib=rb-4.1.0"
  ],
  "raw-denim": [
    "https://images.pexels.com/photos/10912871/pexels-photo-10912871.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6275975/pexels-photo-6275975.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/15937625/pexels-photo-15937625.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/235525/pexels-photo-235525.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "selvedge-denim": [
    "https://images.pexels.com/photos/7641026/pexels-photo-7641026.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/30828508/pexels-photo-30828508.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/20900065/pexels-photo-20900065.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/35150388/pexels-photo-35150388.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "stretch-denim": [
    "https://images.pexels.com/photos/173207/pexels-photo-173207.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/4049757/pexels-photo-4049757.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34564983/pexels-photo-34564983.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/19903579/pexels-photo-19903579.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "crepe-back-satin": [
    "https://images.pexels.com/photos/8793876/pexels-photo-8793876.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6276029/pexels-photo-6276029.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6843226/pexels-photo-6843226.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/38583640/pexels-photo-38583640.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "duchesse-satin": [
    "https://images.pexels.com/photos/7232399/pexels-photo-7232399.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/8007349/pexels-photo-8007349.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7988398/pexels-photo-7988398.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/30616036/pexels-photo-30616036.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "charmeuse-satin": [
    "https://images.pexels.com/photos/21926654/pexels-photo-21926654.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/17325398/pexels-photo-17325398.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/21926657/pexels-photo-21926657.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/38583704/pexels-photo-38583704.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "crushed-velvet": [
    "https://images.pexels.com/photos/4112799/pexels-photo-4112799.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/1487821/pexels-photo-1487821.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7717505/pexels-photo-7717505.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7988296/pexels-photo-7988296.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "panne-velvet": [
    "https://images.pexels.com/photos/6843276/pexels-photo-6843276.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6843282/pexels-photo-6843282.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/35150405/pexels-photo-35150405.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/36305726/pexels-photo-36305726.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "silk-velvet": [
    "https://images.pexels.com/photos/15176449/pexels-photo-15176449.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7232401/pexels-photo-7232401.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/10247848/pexels-photo-10247848.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7717487/pexels-photo-7717487.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "cotton-velvet": [
    "https://images.pexels.com/photos/31209268/pexels-photo-31209268.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1650406268594-c5d310f6fbce?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8Q290dG9uJTIwVmVsdmV0JTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4OTB8MA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1650406264829-baf4f242a4de?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8Mnx8Q290dG9uJTIwVmVsdmV0JTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4OTB8MA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1650406268584-8903e4362868?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8NHx8Q290dG9uJTIwVmVsdmV0JTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4OTB8MA&ixlib=rb-4.1.0"
  ],
  "silk-chiffon": [
    "https://images.pexels.com/photos/33264441/pexels-photo-33264441.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/8754101/pexels-photo-8754101.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7794264/pexels-photo-7794264.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/7717488/pexels-photo-7717488.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "polyester-chiffon": [
    "https://images.pexels.com/photos/10479190/pexels-photo-10479190.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/8753304/pexels-photo-8753304.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/5872/fashion-red-yellow-designer-5872.jpg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1650406268594-c5d310f6fbce?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8UG9seWVzdGVyJTIwQ2hpZmZvbiUyMGZhYnJpYyUyMHRleHR1cmUlMjB3ZWF2ZXxlbnwwfDJ8fHwxNzg2MTA1ODkyfDA&ixlib=rb-4.1.0"
  ],
  "crepe-chiffon": [
    "https://images.pexels.com/photos/2318068/pexels-photo-2318068.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/4862997/pexels-photo-4862997.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/4862896/pexels-photo-4862896.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/10507355/pexels-photo-10507355.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "standard-wale-corduroy": [
    "https://images.pexels.com/photos/6843265/pexels-photo-6843265.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/35009336/pexels-photo-35009336.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/35009242/pexels-photo-35009242.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6843239/pexels-photo-6843239.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "pinwale": [
    "https://images.pexels.com/photos/35978931/pexels-photo-35978931.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/36068859/pexels-photo-36068859.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/36299797/pexels-photo-36299797.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/749147/pexels-photo-749147.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "elephant-cord": [
    "https://images.pexels.com/photos/5156155/pexels-photo-5156155.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/34784557/pexels-photo-34784557.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/20133399/pexels-photo-20133399.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/36557286/pexels-photo-36557286.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ],
  "silk-damask": [
    "https://images.pexels.com/photos/7946566/pexels-photo-7946566.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6964261/pexels-photo-6964261.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1693592322106-efad975eb8ee?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8U2lsayUyMERhbWFzayUyMGZhYnJpYyUyMHRleHR1cmUlMjB3ZWF2ZXxlbnwwfDJ8fHwxNzg2MTA1ODk3fDA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1707569590646-2a51751bb9ef?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8Mnx8U2lsayUyMERhbWFzayUyMGZhYnJpYyUyMHRleHR1cmUlMjB3ZWF2ZXxlbnwwfDJ8fHwxNzg2MTA1ODk3fDA&ixlib=rb-4.1.0"
  ],
  "cotton-damask": [
    "https://images.pexels.com/photos/19203196/pexels-photo-19203196.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/2928381/pexels-photo-2928381.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1693592322106-efad975eb8ee?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8MXx8Q290dG9uJTIwRGFtYXNrJTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4OTh8MA&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1707569590647-6338f55e40ea?ixid=M3wxMDIwODIzfDB8MXxzZWFyY2h8Mnx8Q290dG9uJTIwRGFtYXNrJTIwZmFicmljJTIwdGV4dHVyZSUyMHdlYXZlfGVufDB8Mnx8fDE3ODYxMDU4OTh8MA&ixlib=rb-4.1.0"
  ],
  "synthetic-damask": [
    "https://images.pexels.com/photos/21973792/pexels-photo-21973792.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/14840550/pexels-photo-14840550.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/1460884/pexels-photo-1460884.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/15725063/pexels-photo-15725063.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  ]
};

function getProductImagesForSubcat(subSlug: string, catImage: string): string[] {
  const custom = SUB_IMAGES_MAP[subSlug];
  if (custom && custom.length >= 4) {
    return custom;
  }
  if (custom && custom.length > 0) {
    return custom;
  }
  return [
    catImage,
    "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=1000&auto=format&fit=crop&q=80",
  ];
}

export function generateAllFabricProducts(): Product[] {
  const products: Product[] = [];
  let counter = 100;

  for (const cat of FABRIC_TAXONOMY) {
    for (const sub of cat.subcategories) {
      counter++;
      const supp = SUPPLIERS_REF[counter % SUPPLIERS_REF.length];
      const prodId = `prod-tax-${counter}`;
      
      let fiberOrigin = "Plant";
      if (cat.mainFamily.includes("Animal")) fiberOrigin = "Animal";
      else if (cat.mainFamily.includes("Synthetic (Man-Made)")) fiberOrigin = "Synthetic";
      else if (cat.mainFamily.includes("Semi-Synthetic")) fiberOrigin = "Semi-Synthetic";
      else if (cat.name === "Denim" || cat.name === "Corduroy") fiberOrigin = "Plant";
      else if (sub.name.includes("Silk") || sub.name.includes("Wool")) fiberOrigin = "Animal";

      let weaveType = "Plain Weave";
      if (cat.name === "Denim" || sub.name.includes("Twill")) weaveType = "Twill Weave";
      else if (cat.name === "Satin" || sub.name.includes("Satin") || sub.name.includes("Charmeuse")) weaveType = "Satin Weave";
      else if (cat.name === "Velvet" || sub.name.includes("Velvet")) weaveType = "Cut Pile / Velvet";
      else if (cat.name === "Damask" || sub.name.includes("Damask")) weaveType = "Jacquard Weave";
      else if (sub.name.includes("Jersey") || sub.name.includes("Knit")) weaveType = "Knit Structure";
      else if (sub.name.includes("Canvas")) weaveType = "Heavy Plain Canvas";
      else if (sub.name.includes("Corduroy")) weaveType = "Cut Pile Rib (Wale)";

      let texture = "Smooth & Crisp";
      if (sub.name.includes("Velvet") || sub.name.includes("Suede") || sub.name.includes("Cashmere")) texture = "Ultra Soft & Plush";
      else if (sub.name.includes("Linen") || sub.name.includes("Hemp") || sub.name.includes("Tussah")) texture = "Natural Slub Texture";
      else if (sub.name.includes("Leather") || sub.name.includes("Nubuck")) texture = "Supple Grain Nap";
      else if (sub.name.includes("Silk") || sub.name.includes("Charmeuse")) texture = "Silky Smooth & Luminous";
      else if (sub.name.includes("Canvas") || sub.name.includes("Ballistic")) texture = "Rugged & Rigid";

      let gsm = 180;
      if (sub.name.includes("Heavy") || sub.name.includes("Ballistic") || sub.name.includes("Elephant") || sub.name.includes("Canvas") || sub.name.includes("Leather")) gsm = 380 + (counter % 120);
      else if (sub.name.includes("Chiffon") || sub.name.includes("Sheer") || sub.name.includes("Organza")) gsm = 45 + (counter % 35);
      else if (sub.name.includes("Jersey") || sub.name.includes("Microfiber") || sub.name.includes("Silk") || sub.name.includes("Poplin")) gsm = 110 + (counter % 75);
      else gsm = 200 + (counter % 100);

      const isEco = cat.mainFamily.includes("Plant") || sub.name.includes("Organic") || sub.name.includes("Tencel") || sub.name.includes("Bamboo") || sub.name.includes("Recycled") || sub.name.includes("Lyocell");
      const isBreathable = !sub.name.includes("Neoprene") && !sub.name.includes("Ballistic");
      const isMoistureWicking = sub.name.includes("Active") || sub.name.includes("Microfiber") || sub.name.includes("Nylon") || sub.name.includes("Bamboo") || sub.name.includes("Hemp") || sub.name.includes("Merino");
      const isStretch = sub.name.includes("Stretch") || sub.name.includes("Lycra") || sub.name.includes("Spandex") || sub.name.includes("Elastane") || sub.name.includes("Jersey") || sub.name.includes("Panne");
      const isWrinkleResistant = cat.mainFamily.includes("Synthetic") || sub.name.includes("Wrinkle") || sub.name.includes("Poly") || sub.name.includes("Satin");
      const isHypoallergenic = sub.name.includes("Organic") || sub.name.includes("Bamboo") || sub.name.includes("Silk") || sub.name.includes("Alpaca") || sub.name.includes("Lyocell");

      const pricePerMeter = Math.round((8 + (counter % 35) + (sub.name.includes("Cashmere") || sub.name.includes("Mulberry") || sub.name.includes("Full-Grain") ? 35 : 0)) * 100) / 100;
      const moq = sub.name.includes("Cashmere") || sub.name.includes("Leather") ? 15 : (counter % 3 === 0 ? 30 : 50);

      const prodImages = getProductImagesForSubcat(sub.slug, cat.image);

      products.push({
        id: prodId,
        name: `Premium ${sub.name} Fabric`,
        slug: `premium-${sub.slug}-fabric`,
        mainFamily: cat.mainFamily,
        categoryId: cat.id,
        categoryName: cat.name,
        subcategoryId: sub.id,
        subcategoryName: sub.name,
        supplierId: supp.id,
        supplierName: supp.name,
        supplierSlug: supp.slug,
        supplierLogo: supp.logo,
        sku: `SKU-${cat.slug.toUpperCase().slice(0, 3)}-${counter}`,
        shortDescription: `Certified high-grade ${sub.name} fabric engineered for ${sub.commonApplications.slice(0, 2).join(" and ")}.`,
        description: `Professional-grade ${sub.name} textile (${cat.mainFamily}). ${sub.description} Excellent structural consistency, colorfastness, and technical performance suitable for commercial manufacturing.`,
        composition: `${sub.name} (Grade A Fiber)`,
        fiberOrigin,
        fabricType: sub.name,
        weaveType,
        texture,
        gsm,
        widthCm: sub.name.includes("Selvedge") ? 85 : 150,
        colors: [
          { name: "Classic Natural", hex: "#fdfbf7" },
          { name: "Deep Indigo Navy", hex: "#1e3a8a" },
          { name: "Onyx Charcoal", hex: "#1f2937" },
          { name: "Terracotta Earth", hex: "#9a3412" },
        ],
        moq,
        pricePerMeter,
        stockQuantity: 1200 + (counter * 10) % 3000,
        availabilityStatus: "IN_STOCK",
        breathable: isBreathable,
        moistureWicking: isMoistureWicking,
        stretchable: isStretch,
        wrinkleResistant: isWrinkleResistant,
        ecoFriendly: isEco,
        hypoallergenic: isHypoallergenic,
        durabilityRating: 4 + (counter % 2 === 0 ? 1 : 0),
        softnessRating: 3 + (counter % 3),
        applicationTags: sub.commonApplications,
        tags: [cat.name, sub.name, fiberOrigin, isEco ? "Eco-Friendly" : "Performance"],
        images: prodImages,
        certifications: isEco ? ["GOTS Certified", "OEKO-TEX Standard 100"] : ["ISO 9001 Quality Certified", "OEKO-TEX 100"],
        careInstructions: sub.name.includes("Silk") || sub.name.includes("Wool") || sub.name.includes("Leather") ? "Dry clean only. Handle with care." : "Machine wash cool (30°C), tumble dry low or line dry in shade.",
        sustainabilityNotes: isEco ? "Sourced from certified eco-friendly regenerative mills with closed-loop processing and non-toxic dyes." : "Complies with international environmental textile safety standards.",
        rating: 4.8 + (counter % 3) * 0.08,
        reviewsCount: 15 + (counter % 80),
        ecoScore: isEco ? "A+" : "A",
        isApproved: 1,
        isFeatured: counter % 5 === 0 ? 1 : 0,
        isTrending: counter % 7 === 0 ? 1 : 0,
        createdAt: "2026-07-15T10:00:00Z",
      });
    }
  }

  return products;
}
