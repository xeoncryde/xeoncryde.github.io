using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class GameOver : MonoBehaviour
{
    private Canvas canvas;
    private bool isShowing = false;

    void Awake()
    {
        BuildUI();
        Hide();
    }

    void BuildUI()
    {
        GameObject canvasObj = new GameObject("GameOverCanvas");
        canvasObj.transform.SetParent(transform, false);
        canvas = canvasObj.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        canvas.sortingOrder = 100;
        CanvasScaler scaler = canvasObj.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1920, 1080);
        canvasObj.AddComponent<UnityEngine.UI.GraphicRaycaster>();

        Font font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");

        // Background
        GameObject bg = new GameObject("Background");
        bg.transform.SetParent(canvasObj.transform, false);
        Image bgImg = bg.AddComponent<Image>();
        bgImg.color = new Color(0f, 0f, 0f, 0.75f);
        RectTransform bgRt = bg.GetComponent<RectTransform>();
        bgRt.anchorMin = Vector2.zero;
        bgRt.anchorMax = Vector2.one;
        bgRt.offsetMin = Vector2.zero;
        bgRt.offsetMax = Vector2.zero;

        // Panel
        GameObject panel = new GameObject("Panel");
        panel.transform.SetParent(canvasObj.transform, false);
        Image panelImg = panel.AddComponent<Image>();
        panelImg.color = new Color(0.98f, 0.91f, 0.73f);
        RectTransform panelRt = panel.GetComponent<RectTransform>();
        panelRt.anchorMin = new Vector2(0.3f, 0.2f);
        panelRt.anchorMax = new Vector2(0.7f, 0.8f);
        panelRt.offsetMin = Vector2.zero;
        panelRt.offsetMax = Vector2.zero;

        // Title
        CreateText(panel.transform, "Title", "GAME OVER",
            font, 72, new Color(0.7f, 0.1f, 0.1f), TextAnchor.MiddleCenter,
            new Vector2(0.1f, 0.65f), new Vector2(0.9f, 0.95f));

        // Message
        CreateText(panel.transform, "Message", "You ran out of sauce!",
            font, 36, new Color(0.25f, 0.13f, 0.04f), TextAnchor.MiddleCenter,
            new Vector2(0.1f, 0.45f), new Vector2(0.9f, 0.65f));

        // Retry button
        CreateButton(panel.transform, "RetryButton", "RETRY",
            font, new Color(0.95f, 0.55f, 0.10f), new Color(0.25f, 0.13f, 0.04f),
            new Vector2(0.1f, 0.1f), new Vector2(0.45f, 0.4f), Restart);

        // Main Menu button
        CreateButton(panel.transform, "MenuButton", "MAIN MENU",
            font, new Color(0.82f, 0.62f, 0.28f), new Color(0.25f, 0.13f, 0.04f),
            new Vector2(0.55f, 0.1f), new Vector2(0.9f, 0.4f), GoToMainMenu);
    }

    void CreateText(Transform parent, string name, string content, Font font,
        int size, Color color, TextAnchor anchor, Vector2 anchorMin, Vector2 anchorMax)
    {
        GameObject obj = new GameObject(name);
        obj.transform.SetParent(parent, false);
        Text t = obj.AddComponent<Text>();
        t.text = content;
        t.font = font;
        t.fontSize = size;
        t.color = color;
        t.alignment = anchor;
        RectTransform rt = obj.GetComponent<RectTransform>();
        rt.anchorMin = anchorMin;
        rt.anchorMax = anchorMax;
        rt.offsetMin = Vector2.zero;
        rt.offsetMax = Vector2.zero;
    }

    void CreateButton(Transform parent, string name, string label, Font font,
        Color bgColor, Color textColor, Vector2 anchorMin, Vector2 anchorMax,
        UnityEngine.Events.UnityAction callback)
    {
        GameObject obj = new GameObject(name);
        obj.transform.SetParent(parent, false);
        Image img = obj.AddComponent<Image>();
        img.color = bgColor;
        Button btn = obj.AddComponent<Button>();
        btn.onClick.AddListener(callback);
        RectTransform rt = obj.GetComponent<RectTransform>();
        rt.anchorMin = anchorMin;
        rt.anchorMax = anchorMax;
        rt.offsetMin = Vector2.zero;
        rt.offsetMax = Vector2.zero;

        GameObject textObj = new GameObject("Label");
        textObj.transform.SetParent(obj.transform, false);
        Text t = textObj.AddComponent<Text>();
        t.text = label;
        t.font = font;
        t.fontSize = 32;
        t.color = textColor;
        t.alignment = TextAnchor.MiddleCenter;
        RectTransform tRt = textObj.GetComponent<RectTransform>();
        tRt.anchorMin = Vector2.zero;
        tRt.anchorMax = Vector2.one;
        tRt.offsetMin = Vector2.zero;
        tRt.offsetMax = Vector2.zero;
    }

    public void Show()
    {
        isShowing = true;
        if (canvas != null) canvas.gameObject.SetActive(true);
        Time.timeScale = 0f;
    }

    public void Hide()
    {
        isShowing = false;
        if (canvas != null) canvas.gameObject.SetActive(false);
    }

    void Restart()
    {
        Time.timeScale = 1f;
        SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }

    void GoToMainMenu()
    {
        Time.timeScale = 1f;
        SceneManager.LoadScene("MainMenu");
    }
}
