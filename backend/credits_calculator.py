"""
Calculateur d'exemples d'utilisation avec 500 crédits (= 13€)
"""

from credits_config import CREDITS_CONFIG, get_credits_cost

def calculate_usage_examples():
    """
    Calculer combien d'utilisations on peut faire avec 500 crédits
    """
    initial_credits = CREDITS_CONFIG["meta"]["initial_credits"]
    euro_value = CREDITS_CONFIG["meta"]["initial_credits_value_eur"]
    
    examples = []
    
    # NanoBanana (1.5 crédits/image)
    nano_banana_cost = get_credits_cost("nano_banana")
    nano_banana_count = int(initial_credits / nano_banana_cost)
    examples.append({
        "model": "NanoBanana",
        "unit": "images",
        "count": nano_banana_count,
        "cost_per_unit": nano_banana_cost
    })
    
    # SORA 2 (3.85 crédits/seconde, vidéo 5 secondes typique)
    sora_cost = get_credits_cost("sora_2")
    sora_videos_5s = int(initial_credits / (sora_cost * 5))
    examples.append({
        "model": "SORA 2",
        "unit": "vidéos de 5s",
        "count": sora_videos_5s,
        "cost_per_unit": sora_cost * 5
    })
    
    # Google VEO 3.1 sans audio (7.69 crédits/seconde, vidéo 5 secondes)
    veo_cost = get_credits_cost("google_veo_3_1", variant="without_audio")
    veo_videos_5s = int(initial_credits / (veo_cost * 5))
    examples.append({
        "model": "Google VEO 3.1",
        "unit": "vidéos de 5s (sans audio)",
        "count": veo_videos_5s,
        "cost_per_unit": veo_cost * 5
    })
    
    # Kling AI v2.1 standard (1.92 crédits/seconde, vidéo 5 secondes)
    kling_cost = get_credits_cost("kling_ai_v2_1", variant="standard")
    kling_videos_5s = int(initial_credits / (kling_cost * 5))
    examples.append({
        "model": "Kling AI v2.1 (standard)",
        "unit": "vidéos de 5s",
        "count": kling_videos_5s,
        "cost_per_unit": kling_cost * 5
    })
    
    # Seedream 4 (1.15 crédits/image)
    seedream_cost = get_credits_cost("seedream_4")
    seedream_count = int(initial_credits / seedream_cost)
    examples.append({
        "model": "Seedream 4",
        "unit": "images",
        "count": seedream_count,
        "cost_per_unit": seedream_cost
    })
    
    # Flux Kontext Pro (1.54 crédits/image)
    flux_cost = get_credits_cost("flux_kontext_pro")
    flux_count = int(initial_credits / flux_cost)
    examples.append({
        "model": "Flux Kontext Pro",
        "unit": "images",
        "count": flux_count,
        "cost_per_unit": flux_cost
    })
    
    # Grok 2 Image (2.69 crédits/image)
    grok_cost = get_credits_cost("grok_2_image")
    grok_count = int(initial_credits / grok_cost)
    examples.append({
        "model": "Grok 2 Image",
        "unit": "images",
        "count": grok_count,
        "cost_per_unit": grok_cost
    })
    
    # Image Upscaler (1.92 crédits pour petites images)
    upscaler_cost = get_credits_cost("image_upscaler", megapixels=2)
    upscaler_count = int(initial_credits / upscaler_cost)
    examples.append({
        "model": "Image Upscaler (petites images)",
        "unit": "images",
        "count": upscaler_count,
        "cost_per_unit": upscaler_cost
    })
    
    return {
        "total_credits": initial_credits,
        "euro_value": euro_value,
        "examples": examples
    }

if __name__ == "__main__":
    # Test du calculateur
    results = calculate_usage_examples()
    print(f"\n🎁 Avec {results['total_credits']} crédits (≈ {results['euro_value']}€), vous pouvez générer:\n")
    for ex in results['examples']:
        print(f"  • {ex['count']} {ex['unit']} avec {ex['model']} ({ex['cost_per_unit']} crédits par unité)")
    print("\n  • ChatGPT: ILLIMITÉ ∞\n")
