export interface CatalogProduct {
  id: string
  name: string
  category: 'dairy' | 'produce' | 'snacks' | 'grains' | 'household' | 'other'
  price: string
  image: string
  badge?: string
  tagline: string
}

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'prod-milk',
    name: 'Organic Farm Milk',
    category: 'dairy',
    price: '₹64',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80',
    badge: 'Daily Fresh',
    tagline: 'Whole milk pasteurized & chilled',
  },
  {
    id: 'prod-bread',
    name: 'Artisan Sourdough Bread',
    category: 'grains',
    price: '₹85',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    badge: 'Bakery Special',
    tagline: 'Freshly baked stone-ground loaf',
  },
  {
    id: 'prod-bananas',
    name: 'Robusta Bananas',
    category: 'produce',
    price: '₹48 / dozen',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',
    badge: 'Sweet & Ripe',
    tagline: 'Naturally ripened Karnataka bananas',
  },
  {
    id: 'prod-eggs',
    name: 'Pasture-Raised Brown Eggs',
    category: 'dairy',
    price: '₹92 / pack of 6',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=400&q=80',
    badge: 'High Protein',
    tagline: 'Farm-fresh enriched free-range eggs',
  },
  {
    id: 'prod-rice',
    name: 'Royal Basmati Rice',
    category: 'grains',
    price: '₹140 / kg',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    badge: 'Aged 2 Yrs',
    tagline: 'Long grain aromatic aged basmati',
  },
  {
    id: 'prod-apples',
    name: 'Crisp Shimla Apples',
    category: 'produce',
    price: '₹120 / kg',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
    badge: 'Seasonal',
    tagline: 'Sweet and crunchy orchard fresh apples',
  },
  {
    id: 'prod-tomatoes',
    name: 'Vine-Ripened Tomatoes',
    category: 'produce',
    price: '₹35 / kg',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    tagline: 'Juicy organic farm tomatoes',
  },
  {
    id: 'prod-oil',
    name: 'Cold-Pressed Olive Oil',
    category: 'household',
    price: '₹380',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
    badge: 'Pure Extra Virgin',
    tagline: 'First cold pressed unfiltered oil',
  },
]

export const PRODUCT_IMAGE_LOOKUP: Record<string, string> = {
  milk: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80',
  doodh: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80',
  paalu: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80',
  bread: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80',
  rotte: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80',
  bananas: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=300&q=80',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=300&q=80',
  aratipandlu: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=300&q=80',
  eggs: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=300&q=80',
  egg: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=300&q=80',
  gudlu: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=300&q=80',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80',
  biyyam: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80',
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=300&q=80',
  apples: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=300&q=80',
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80',
  tomatoes: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80',
  tamata: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80',
  onion: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=300&q=80',
  onions: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=300&q=80',
  ullipaya: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=300&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80',
  potatoes: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80',
  oil: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80',
  noon: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80',
  sugar: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&w=300&q=80',
  curd: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80',
  perugu: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80',
  tea: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80',
}

export function getProductImage(itemName: string, category: string): string {
  const normalized = itemName.toLowerCase().trim()
  for (const [key, url] of Object.entries(PRODUCT_IMAGE_LOOKUP)) {
    if (normalized.includes(key)) {
      return url
    }
  }
  // Category defaults
  if (category === 'dairy') return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80'
  if (category === 'produce') return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=300&q=80'
  if (category === 'grains') return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80'
  if (category === 'snacks') return 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=300&q=80'
  if (category === 'household') return 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=300&q=80'
  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'
}
