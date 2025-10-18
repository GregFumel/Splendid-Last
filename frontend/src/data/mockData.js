export const mockAITools = [
  // Nouvelles IA - Vidéo
  {
    id: 1,
    name: "SORA 2",
    description: "Le dernier modèle de génération vidéo d'OpenAI avec qualité cinématographique.",
    category: "video",
    image: "https://customer-assets.emergentagent.com/job_d1e17cd1-d4b1-4e77-89f1-4869587941f4/artifacts/knsgp471_Screenshot_2025-10-07_at_3.03..png",
    fullDescription: "la génération de vidéos cinématographiques de haute qualité avec SORA 2",
    isNew: true,
    toolType: "video-generator",
    apiEndpoint: "sora2"
  },
  {
    id: 2,
    name: "Google Veo 3.1",
    description: "Création de vidéos haute définition avec la dernière IA avancée de Google.",
    category: "video",
    image: "https://customer-assets.emergentagent.com/job_d1e17cd1-d4b1-4e77-89f1-4869587941f4/artifacts/bu2diubd_veo3.1-sm.gif",
    fullDescription: "la création de vidéos haute définition avec Google Veo 3.1",
    isNew: true,
    toolType: "video-generator",  // Type d'outil pour le backend
    apiEndpoint: "google-veo"  // Endpoint backend à utiliser
  },
  {
    id: 3,
    name: "Alibaba Wan 2.5",
    description: "Solution de génération vidéo avancée d'Alibaba avec qualité exceptionnelle.",
    category: "video",
    image: "https://customer-assets.emergentagent.com/job_d1e17cd1-d4b1-4e77-89f1-4869587941f4/artifacts/tfsncvf7_output.gif",
    fullDescription: "la génération de vidéos de haute qualité avec Alibaba Wan 2.5",
    isNew: true
  },
  // Nouvelles IA - Image
  {
    id: 4,
    name: "Seedream 4",
    description: "Générateur d'images de nouvelle génération avec des résultats époustouflants.",
    category: "image",
    image: "https://customer-assets.emergentagent.com/job_d1e17cd1-d4b1-4e77-89f1-4869587941f4/artifacts/43o9wrgb_seedream4-sm.jpg",
    fullDescription: "la génération d'images ultra-réalistes et artistiques avec Seedream 4",
    isNew: true
  },
  {
    id: 5,
    name: "Grok",
    description: "IA de génération d'images puissante développée par xAI.",
    category: "image",
    image: "https://customer-assets.emergentagent.com/job_d1e17cd1-d4b1-4e77-89f1-4869587941f4/artifacts/xd3xussb_tmp3jprvm7n.png",
    fullDescription: "la création d'images créatives et réalistes avec Grok",
    isNew: true
  },
  {
    id: 6,
    name: "NanoBanana",
    description: "Générateur d'images avancé propulsé par Google Gemini.",
    category: "image",
    image: "https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/fhqzy4ql_this%20-%2001.png",
    fullDescription: "la génération d'images créatives et réalistes à partir de texte avec Google Gemini",
    isNew: true,
    toolType: "image-generator",
    apiEndpoint: "nanobanana"
  },
  // Vidéo
  {
    id: 7,
    name: "Kling AI",
    description: "Générez des avatars parlants ultra-réalistes.",
    category: "video",
    image: "https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/li3xo3mc_replicate-prediction-2epyczsz.gif",
    fullDescription: "la génération d'avatars parlants ultra-réalistes"
  },
  {
    id: 8,
    name: "Video Upscale AI",
    description: "Améliorez la résolution de vos vidéos jusqu'à 8K.",
    category: "video",
    image: "https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/gnt5f1ea_topaz_img%20-%2001.png",
    fullDescription: "l'amélioration de la résolution de vidéos existantes"
  },
  {
    id: 9,
    name: "UGC Creator AI",
    description: "Créez des vidéos UGC authentiques pour vendre vos produits.",
    category: "video",
    image: "https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/x8wpwp0u_tmp2ni84f_5.gif",
    fullDescription: "la création de vidéos UGC avec des acteurs virtuels présentant vos produits"
  },
  // Image
  {
    id: 10,
    name: "Midjourney V7",
    description: "L'outil de référence pour la génération d'images artistiques.",
    category: "image",
    image: "https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/ei2pu1s3_ew_20240925-midjourney-review.png",
    fullDescription: "la génération d'images artistiques et photoréalistes"
  },
  {
    id: 11,
    name: "DALL-E 3",
    description: "Transformez n'importe quelle idée en image unique.",
    category: "image",
    image: "https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/kjh1zimg_Screenshot_2025-05-12_at_1.31.02P%20-%2001.png",
    fullDescription: "la transformation d'idées texte en images uniques"
  },
  {
    id: 12,
    name: "AI Image Upscaler",
    description: "Le meilleur upscaler du marché pour améliorer vos images.",
    category: "image",
    image: "https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/8um9qont_Bildschirmfoto_2024-03-30_um_09.2%20-%2001.png",
    fullDescription: "l'amélioration et l'upscaling d'images avec ajout de détails ultra-précis",
    toolType: "image-upscaler",
    apiEndpoint: "image-upscaler"
  },
  // Text
  {
    id: 13,
    name: "ChatGPT-5",
    description: "Assistant conversationnel avancé propulsé par OpenAI.",
    category: "assist",
    image: "https://customer-assets.emergentagent.com/job_gemini-draw/artifacts/444ywiim_yau7ce7n_replicate-prediction-qhzgvzbn7.png",
    fullDescription: "Conversation intelligente avec ChatGPT-5 d'OpenAI pour répondre à toutes vos questions",
    toolType: "chat",
    apiEndpoint: "chatgpt5"
  }
];