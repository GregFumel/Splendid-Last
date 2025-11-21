export const mockAITools = [
  // 1. Google Veo 3.1
  {
    id: 1,
    name: "Google Veo 3.1",
    description: "Création de vidéos haute définition avec la dernière IA avancée de Google.",
    category: "video",
    image: "https://customer-assets.emergentagent.com/job_d1e17cd1-d4b1-4e77-89f1-4869587941f4/artifacts/bu2diubd_veo3.1-sm.gif",
    fullDescription: "la création de vidéos haute définition avec Google Veo 3.1",
    isNew: true,
    toolType: "video-generator",
    apiEndpoint: "google-veo"
  },
  // 2. Image Upscaler
  {
    id: 5,
    name: "Image Upscaler",
    description: "Le meilleur upscaler du marché pour améliorer vos images.",
    category: "image",
    image: "https://customer-assets.emergentagent.com/job_nano-banana-fix/artifacts/vtefylxi_crystal-cover%20%281%29.webp",
    fullDescription: "l'amélioration et l'upscaling d'images avec ajout de détails ultra-précis",
    isTop: true,
    toolType: "image-upscaler",
    apiEndpoint: "image-upscaler"
  },
  // 3. Nano Banana Pro
  {
    id: 12,
    name: "Nano Banana Pro",
    description: "Génération d'images avancée avec Gemini 3 Pro - Texte précis, raisonnement avancé et contrôles créatifs professionnels.",
    category: "image",
    image: "https://customer-assets.emergentagent.com/job_e614690b-c85a-44e5-9f1f-f2c2091dbcf4/artifacts/nev3xsrv_image.png",
    fullDescription: "Génération et édition d'images professionnelles avec texte précis, jusqu'à 14 images en entrée, résolution 4K",
    isNew: true,
    toolType: "image-generator",
    apiEndpoint: "nanobanana-pro"
  },
  // 4. Gemini 3 Pro
  {
    id: 13,
    name: "Gemini 3 Pro",
    description: "Modèle de raisonnement le plus avancé de Google avec capacités multimodales (texte, images, vidéos, audio).",
    category: "assist",
    image: "https://customer-assets.emergentagent.com/job_e614690b-c85a-44e5-9f1f-f2c2091dbcf4/artifacts/c73k1zs0_image.png",
    fullDescription: "Raisonnement avancé multimodal avec support d'images, vidéos et audio pour apprendre, construire et planifier",
    isNew: true,
    toolType: "chat",
    apiEndpoint: "gemini3-pro"
  },
  // 5. ChatGPT 5.1
  {
    id: 14,
    name: "ChatGPT 5.1",
    description: "Meilleur modèle d'OpenAI pour le coding et tâches agentiques avec raisonnement configurable.",
    category: "assist",
    image: "https://customer-assets.emergentagent.com/job_e614690b-c85a-44e5-9f1f-f2c2091dbcf4/artifacts/az918hzc_image.png",
    fullDescription: "Assistant avancé pour le coding et tâches complexes avec niveaux de raisonnement et verbosité personnalisables",
    isNew: true,
    toolType: "chat",
    apiEndpoint: "chatgpt51"
  },
  // 6. Kling AI v2.1
  {
    id: 4,
    name: "Kling AI v2.1",
    description: "Génération de vidéos à partir d'images avec transitions fluides (image-to-video).",
    category: "video",
    image: "https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/li3xo3mc_replicate-prediction-2epyczsz.gif",
    fullDescription: "la génération de vidéos à partir d'images de départ et de fin avec Kling AI v2.1",
    isTop: true,
    toolType: "video-generator",
    apiEndpoint: "kling"
  },
  // 7. NanoBanana
  {
    id: 2,
    name: "NanoBanana",
    description: "Générateur d'images avancé propulsé par Google Gemini.",
    category: "image",
    image: "https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/fhqzy4ql_this%20-%2001.png",
    fullDescription: "la génération d'images créatives et réalistes à partir de texte avec Google Gemini",
    toolType: "image-generator",
    apiEndpoint: "nanobanana"
  },
  // 8. SORA 2
  {
    id: 3,
    name: "SORA 2",
    description: "Le dernier modèle de génération vidéo d'OpenAI avec qualité cinématographique.",
    category: "video",
    image: "https://customer-assets.emergentagent.com/job_d1e17cd1-d4b1-4e77-89f1-4869587941f4/artifacts/knsgp471_Screenshot_2025-10-07_at_3.03..png",
    fullDescription: "la génération de vidéos cinématographiques de haute qualité avec SORA 2",
    isNew: true,
    toolType: "video-generator",
    apiEndpoint: "sora2"
  },
  // 9. Grok
  {
    id: 7,
    name: "Grok",
    description: "IA de génération d'images puissante développée par xAI.",
    category: "image",
    image: "https://customer-assets.emergentagent.com/job_d1e17cd1-d4b1-4e77-89f1-4869587941f4/artifacts/xd3xussb_tmp3jprvm7n.png",
    fullDescription: "la création d'images créatives et réalistes avec Grok",
    isNew: true,
    toolType: "image-generator",
    apiEndpoint: "grok"
  },
  // 8. Alibaba Wan 2.5
  {
    id: 8,
    name: "Alibaba Wan 2.5",
    description: "Solution de génération vidéo avancée d'Alibaba avec qualité exceptionnelle.",
    category: "video",
    image: "https://customer-assets.emergentagent.com/job_d1e17cd1-d4b1-4e77-89f1-4869587941f4/artifacts/tfsncvf7_output.gif",
    fullDescription: "la génération de vidéos de haute qualité avec Alibaba Wan 2.5",
    isNew: true,
    toolType: "video-generator",
    apiEndpoint: "alibaba-wan"
  },
  // 9. Flux Kontext Pro
  {
    id: 9,
    name: "Flux Kontext Pro",
    description: "L'outil de référence pour la génération d'images artistiques.",
    category: "image",
    image: "https://customer-assets.emergentagent.com/job_nano-banana-fix/artifacts/uc4nfrpn_Capture%20d%E2%80%99e%CC%81cran%202025-10-18%20a%CC%80%2020.36.26.png",
    fullDescription: "la génération d'images artistiques et photoréalistes",
    toolType: "flux-kontext",
    apiEndpoint: "flux-kontext"
  },
  // 10. Video Upscale AI
  {
    id: 10,
    name: "Video Upscale AI",
    description: "Améliorez la résolution de vos vidéos jusqu'à 4K avec Topaz Labs.",
    category: "video",
    image: "https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/gnt5f1ea_topaz_img%20-%2001.png",
    fullDescription: "l'amélioration de la résolution de vidéos existantes jusqu'à 4K",
    toolType: "video-upscaler",
    apiEndpoint: "video-upscale"
  },
  // 11. ChatGPT-5
  {
    id: 11,
    name: "ChatGPT-5",
    description: "Assistant conversationnel avancé propulsé par OpenAI.",
    category: "assist",
    image: "https://customer-assets.emergentagent.com/job_gemini-draw/artifacts/444ywiim_yau7ce7n_replicate-prediction-qhzgvzbn7.png",
    fullDescription: "Conversation intelligente avec ChatGPT-5 d'OpenAI pour répondre à toutes vos questions",
    toolType: "chat",
    apiEndpoint: "chatgpt5"
  },
  // 12. Nano Banana Pro
  {
    id: 12,
    name: "Nano Banana Pro",
    description: "Génération d'images avancée avec Gemini 3 Pro - Texte précis, raisonnement avancé et contrôles créatifs professionnels.",
    category: "image",
    image: "https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/fhqzy4ql_this%20-%2001.png",
    fullDescription: "Génération et édition d'images professionnelles avec texte précis, jusqu'à 14 images en entrée, résolution 4K",
    isNew: true,
    toolType: "image-generator",
    apiEndpoint: "nanobanana-pro"
  },
  // 13. Gemini 3 Pro
  {
    id: 13,
    name: "Gemini 3 Pro",
    description: "Modèle de raisonnement le plus avancé de Google avec capacités multimodales (texte, images, vidéos, audio).",
    category: "assist",
    image: "https://customer-assets.emergentagent.com/job_gemini-draw/artifacts/444ywiim_yau7ce7n_replicate-prediction-qhzgvzbn7.png",
    fullDescription: "Raisonnement avancé multimodal avec support d'images, vidéos et audio pour apprendre, construire et planifier",
    isNew: true,
    toolType: "chat",
    apiEndpoint: "gemini3-pro"
  },
  // 14. ChatGPT 5.1
  {
    id: 14,
    name: "ChatGPT 5.1",
    description: "Meilleur modèle d'OpenAI pour le coding et tâches agentiques avec raisonnement configurable.",
    category: "assist",
    image: "https://customer-assets.emergentagent.com/job_gemini-draw/artifacts/444ywiim_yau7ce7n_replicate-prediction-qhzgvzbn7.png",
    fullDescription: "Assistant avancé pour le coding et tâches complexes avec niveaux de raisonnement et verbosité personnalisables",
    isNew: true,
    toolType: "chat",
    apiEndpoint: "chatgpt51"
  }
];