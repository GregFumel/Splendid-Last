"""
Configuration du système de crédits
Barème de consommation des crédits IA
"""

CREDITS_CONFIG = {
    "meta": {
        "description": "Barème de consommation des crédits IA — 500 crédits gratuits par utilisateur = 13€ d'utilisation. Les crédits sont déduits selon le coût réel des API.",
        "currency": "EUR",
        "euro_per_credit": 0.026,
        "rounding": {"mode": "ceil", "step_credit": 0.5},
        "initial_credits": 500,
        "initial_credits_value_eur": 13.0
    },
    "models": [
        {
            "key": "chatgpt",
            "display_name": "ChatGPT",
            "unit": "message",
            "credits_per_unit": 0,
            "unmetered": True,
            "notes": "Usage illimité et gratuit"
        },
        {
            "key": "topaz_video_upscale",
            "display_name": "Video Upscale AI (Topaz video-upscale)",
            "unit": "job",
            "credits_per_unit": 1.92
        },
        {
            "key": "flux_kontext_pro",
            "display_name": "Flux Kontext Pro",
            "unit": "image",
            "credits_per_unit": 1.54
        },
        {
            "key": "alibaba_wan_2_5",
            "display_name": "Alibaba WAN 2.5",
            "unit": "second",
            "variants": [
                {"variant": "480p", "credits_per_unit": 1.92},
                {"variant": "720p", "credits_per_unit": 3.85},
                {"variant": "1080p", "credits_per_unit": 5.77}
            ]
        },
        {
            "key": "grok_2_image",
            "display_name": "Grok 2 Image",
            "unit": "image",
            "credits_per_unit": 2.69
        },
        {
            "key": "seedream_4",
            "display_name": "Seedream 4",
            "unit": "image",
            "credits_per_unit": 1.15
        },
        {
            "key": "image_upscaler",
            "display_name": "Image Upscaler",
            "unit": "image",
            "tiers": [
                {"max_megapixels": 4, "credits_per_unit": 1.92},
                {"max_megapixels": 8, "credits_per_unit": 3.85},
                {"max_megapixels": 16, "credits_per_unit": 7.69},
                {"max_megapixels": 25, "credits_per_unit": 15.38, "or_above": True}
            ]
        },
        {
            "key": "kling_ai_v2_1",
            "display_name": "Kling AI v2.1",
            "unit": "second",
            "variants": [
                {"variant": "standard", "credits_per_unit": 1.92},
                {"variant": "pro", "credits_per_unit": 3.46}
            ]
        },
        {
            "key": "sora_2",
            "display_name": "SORA 2",
            "unit": "second",
            "credits_per_unit": 3.85
        },
        {
            "key": "nano_banana",
            "display_name": "NanoBanana",
            "unit": "image",
            "credits_per_unit": 1.5
        },
        {
            "key": "google_veo_3_1",
            "display_name": "Google VEO 3.1",
            "unit": "second",
            "variants": [
                {"variant": "without_audio", "credits_per_unit": 7.69},
                {"variant": "with_audio", "credits_per_unit": 15.38}
            ]
        },
        {
            "key": "nano_banana_pro",
            "display_name": "Nano Banana Pro",
            "unit": "image",
            "pricing_usd": {
                "1K": 0.14,
                "2K": 0.14,
                "4K": 0.24
            },
            "variants": [
                {"variant": "1K", "credits_per_unit": 5.12},
                {"variant": "2K", "credits_per_unit": 5.12},
                {"variant": "4K", "credits_per_unit": 8.77}
            ]
        },
        {
            "key": "gemini3_pro",
            "display_name": "Gemini 3 Pro",
            "unit": "message",
            "variants": [
                {"variant": "low", "credits_per_unit": 2.31},
                {"variant": "high", "credits_per_unit": 4.62}
            ]
        },
        {
            "key": "chatgpt51",
            "display_name": "ChatGPT 5.1",
            "unit": "message",
            "variants": [
                {"variant": "none", "credits_per_unit": 1.92},
                {"variant": "low", "credits_per_unit": 3.85},
                {"variant": "medium", "credits_per_unit": 7.69},
                {"variant": "high", "credits_per_unit": 15.38}
            ]
        }
    ]
}

def get_credits_cost(model_key: str, variant: str = None, megapixels: float = None) -> float:
    """
    Calculer le coût en crédits pour un modèle donné
    
    Args:
        model_key: Clé du modèle (ex: "nano_banana", "kling_ai_v2_1")
        variant: Variante du modèle si applicable (ex: "standard", "pro", "720p")
        megapixels: Nombre de mégapixels pour image_upscaler
    
    Returns:
        Nombre de crédits nécessaires
    """
    for model in CREDITS_CONFIG["models"]:
        if model["key"] == model_key:
            # Modèle illimité (gratuit)
            if model.get("unmetered"):
                return 0
            
            # Modèle avec variantes
            if "variants" in model:
                if variant:
                    for v in model["variants"]:
                        if v["variant"] == variant:
                            return v["credits_per_unit"]
                # Si pas de variante spécifiée, retourner la première
                return model["variants"][0]["credits_per_unit"]
            
            # Modèle avec tiers (image_upscaler)
            if "tiers" in model:
                if megapixels is not None:
                    for tier in model["tiers"]:
                        if tier.get("or_above") and megapixels >= tier["max_megapixels"]:
                            return tier["credits_per_unit"]
                        elif megapixels <= tier["max_megapixels"]:
                            return tier["credits_per_unit"]
                # Par défaut, retourner le dernier tier
                return model["tiers"][-1]["credits_per_unit"]
            
            # Modèle simple
            return model.get("credits_per_unit", 0)
    
    # Modèle non trouvé, retourner 0 (gratuit)
    return 0

def is_model_free(model_key: str) -> bool:
    """Vérifier si un modèle est gratuit (illimité)"""
    for model in CREDITS_CONFIG["models"]:
        if model["key"] == model_key:
            return model.get("unmetered", False)
    return False
