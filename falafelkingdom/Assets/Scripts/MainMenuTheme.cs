using UnityEngine;
using UnityEngine.UI;

public class MainMenuTheme : MonoBehaviour
{
    void Start()
    {
        // Warm sandy background
        Camera.main.backgroundColor = new Color(0.98f, 0.91f, 0.73f);
        Camera.main.clearFlags = CameraClearFlags.SolidColor;

        // Recolor all UI Image panels to warm tones
        Image[] images = FindObjectsOfType<Image>(true);
        foreach (Image img in images)
        {
            // Buttons: warm amber
            if (img.GetComponent<Button>() != null)
            {
                ColorBlock cb = img.GetComponent<Button>().colors;
                cb.normalColor = new Color(0.95f, 0.72f, 0.30f);
                cb.highlightedColor = new Color(1f, 0.82f, 0.40f);
                cb.pressedColor = new Color(0.85f, 0.62f, 0.20f);
                img.GetComponent<Button>().colors = cb;
            }
            // Background panels: light cream
            else if (ColorApprox(img.color, Color.white) || ColorApprox(img.color, new Color(0.2f, 0.2f, 0.2f, 1f)))
            {
                img.color = new Color(0.99f, 0.95f, 0.83f, img.color.a);
            }
        }

        // Recolor all Text to dark brown
        Text[] texts = FindObjectsOfType<Text>(true);
        foreach (Text t in texts)
        {
            t.color = new Color(0.25f, 0.13f, 0.04f);
        }
    }

    private bool ColorApprox(Color a, Color b, float tolerance = 0.01f)
    {
        return Mathf.Abs(a.r - b.r) < tolerance &&
               Mathf.Abs(a.g - b.g) < tolerance &&
               Mathf.Abs(a.b - b.b) < tolerance &&
               Mathf.Abs(a.a - b.a) < tolerance;
    }
}
