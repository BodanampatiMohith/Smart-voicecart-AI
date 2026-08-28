"""Static, disclosed substitute map — cheap, honest, useful."""

SUBSTITUTES: dict[str, list[str]] = {
    "milk": ["almond milk", "soy milk", "oat milk"],
    "almond milk": ["soy milk", "oat milk", "milk"],
    "sugar": ["jaggery", "stevia", "honey"],
    "bread": ["multigrain bread", "brown bread", "roti"],
    "butter": ["ghee", "olive oil"],
    "rice": ["quinoa", "millet", "brown rice"],
    "eggs": ["tofu", "chickpea flour"],
    "yogurt": ["curd", "coconut yogurt"],
    "curd": ["yogurt", "buttermilk"],
    "chicken": ["tofu", "paneer", "mushrooms"],
    "paneer": ["tofu", "cottage cheese"],
    "wheat flour": ["ragi flour", "oats"],
    "tea": ["green tea", "coffee"],
    "coffee": ["tea", "chicory"],
    "potato": ["sweet potato"],
    "onion": ["shallots", "spring onion"],
}


def get_substitutes(item: str) -> list[str]:
    key = item.strip().lower()
    if key in SUBSTITUTES:
        return SUBSTITUTES[key]
    for canonical, alts in SUBSTITUTES.items():
        if key == canonical or key in alts:
            return [canonical] + [a for a in alts if a != key]
    return []
