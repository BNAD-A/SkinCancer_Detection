from datetime import datetime
import tensorflow as tf
import numpy as np
from PIL import Image
import os

# Charger le modèle
model = tf.keras.models.load_model(os.path.join("model", "skin_lesion_model.h5"))

# ✅ Ordre des classes selon ton entraînement
class_names = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]

def get_label_explanation(label):
    labels = {
        "nv": "Lésion bénigne (Naevus)",
        "mel": "Mélanome (cancer de la peau)",
        "akiec": "Lésion suspecte (kératose actinique)",
        "bcc": "Carcinome basocellulaire",
        "bkl": "Lésion bénigne kératosique",
        "df": "Dermatofibrome",
        "vasc": "Lésion vasculaire"
    }
    return labels.get(label, "Inconnu")

def get_user_friendly_message(label):
    messages = {
        "mel": "Cette lésion présente des signes de mélanome. Consultez immédiatement un dermatologue.",
        "akiec": "La lésion est probablement précancéreuse. Veuillez consulter un dermatologue pour confirmation.",
        "nv": "Cette lésion semble bénigne (grain de beauté). Un suivi régulier reste recommandé.",
        "bcc": "Cette lésion pourrait être un carcinome basocellulaire. Une consultation médicale est recommandée.",
        "bkl": "Lésion bénigne, généralement sans gravité. Un suivi dermatologique est utile.",
        "df": "Lésion fibreuse bénigne. Pas d’urgence, mais à surveiller.",
        "vasc": "Lésion vasculaire souvent bénigne. Vérification par un spécialiste conseillée."
    }
    return messages.get(label, "Résultat à interpréter avec prudence. Un professionnel doit confirmer le diagnostic.")

def predict_image(image_path):
    try:
        img = Image.open(image_path).convert("RGB").resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array)
        probas = prediction[0]
        predicted_prob = float(np.max(probas))
        predicted_class_index = int(np.argmax(probas))
        predicted_class = class_names[predicted_class_index]

        # ✅ Cas spécial : faible confiance et bénin
        if predicted_prob < 0.25 and predicted_class == "nv":
            return {
                "diagnostic": "Aucune lésion détectée",
                "confiance": f"{predicted_prob * 100:.2f}%",
                "explication": "L’image ne semble pas contenir de lésion suspecte. Aucun signe préoccupant détecté.",
                "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        
        result = {
            "diagnostic": get_label_explanation(predicted_class),
            "confiance": f"{predicted_prob * 100:.2f}%",
            "explication": get_user_friendly_message(predicted_class),
            "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        return result

    except Exception as e:
        print("Erreur pendant la prédiction :", e)
        return {
            "diagnostic": "Erreur",
            "confiance": "0.00%",
            "explication": "Erreur lors de l’analyse de l’image. Réessayez.",
            "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
