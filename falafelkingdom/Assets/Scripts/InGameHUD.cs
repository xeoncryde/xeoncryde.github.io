using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class InGameHUD : MonoBehaviour
{
    private Text sauceText;
    private Text livesText;
    private Text timerText;
    private float startTime;

    void Start()
    {
        startTime = Time.time;
        BuildHUD();

        SauceManager.SauceChanged += OnSauceChanged;
        SauceManager.LivesChanged += OnLivesChanged;
        SauceManager.GameOverTriggered += OnGameOver;
    }

    void OnDestroy()
    {
        SauceManager.SauceChanged -= OnSauceChanged;
        SauceManager.LivesChanged -= OnLivesChanged;
        SauceManager.GameOverTriggered -= OnGameOver;
    }

    void BuildHUD()
    {
        GameObject canvasObj = new GameObject("InGameHUD_Canvas");
        Canvas canvas = canvasObj.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        canvas.sortingOrder = 10;
        CanvasScaler scaler = canvasObj.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1920, 1080);
        canvasObj.AddComponent<UnityEngine.UI.GraphicRaycaster>();

        Font font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");

        // Sauce counter — top left
        GameObject sauceObj = CreateTextElement(canvasObj.transform, "SauceCounter",
            new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(20f, -20f), new Vector2(300f, 60f));
        sauceText = sauceObj.GetComponent<Text>();
        sauceText.font = font;
        sauceText.fontSize = 36;
        sauceText.color = new Color(0.25f, 0.13f, 0.04f);
        sauceText.alignment = TextAnchor.UpperLeft;
        UpdateSauceText(SauceManager.Instance != null ? SauceManager.Instance.sauce : 0);

        // Lives — top right
        GameObject livesObj = CreateTextElement(canvasObj.transform, "LivesCounter",
            new Vector2(1f, 1f), new Vector2(1f, 1f), new Vector2(-320f, -20f), new Vector2(300f, 60f));
        livesText = livesObj.GetComponent<Text>();
        livesText.font = font;
        livesText.fontSize = 36;
        livesText.color = new Color(0.8f, 0.1f, 0.1f);
        livesText.alignment = TextAnchor.UpperRight;
        UpdateLivesText(SauceManager.Instance != null ? SauceManager.Instance.lives : 3);

        // Timer — top center
        GameObject timerObj = CreateTextElement(canvasObj.transform, "Timer",
            new Vector2(0.5f, 1f), new Vector2(0.5f, 1f), new Vector2(-150f, -20f), new Vector2(300f, 60f));
        timerText = timerObj.GetComponent<Text>();
        timerText.font = font;
        timerText.fontSize = 36;
        timerText.color = new Color(0.25f, 0.13f, 0.04f);
        timerText.alignment = TextAnchor.UpperCenter;
    }

    GameObject CreateTextElement(Transform parent, string name,
        Vector2 anchorMin, Vector2 anchorMax, Vector2 anchoredPos, Vector2 sizeDelta)
    {
        GameObject obj = new GameObject(name);
        obj.transform.SetParent(parent, false);
        Text text = obj.AddComponent<Text>();
        text.text = "";
        RectTransform rt = obj.GetComponent<RectTransform>();
        rt.anchorMin = anchorMin;
        rt.anchorMax = anchorMax;
        rt.anchoredPosition = anchoredPos;
        rt.sizeDelta = sizeDelta;
        return obj;
    }

    void Update()
    {
        if (timerText == null) return;
        float t = Time.time - startTime;
        string minutes = ((int)(t / 60)).ToString();
        string seconds = ((int)(t % 60)).ToString("D2");
        string decimals = ((int)(t * 100) % 100).ToString("D2");
        timerText.text = minutes + ":" + seconds + "." + decimals;
    }

    void OnSauceChanged(int newSauce)
    {
        UpdateSauceText(newSauce);
    }

    void OnLivesChanged(int newLives)
    {
        UpdateLivesText(newLives);
    }

    void OnGameOver()
    {
        GameOver go = FindObjectOfType<GameOver>();
        if (go == null)
        {
            GameObject goObj = new GameObject("GameOverManager");
            go = goObj.AddComponent<GameOver>();
        }
        go.Show();
    }

    void UpdateSauceText(int amount)
    {
        if (sauceText != null)
            sauceText.text = "\U0001f9c6 x " + amount;
    }

    void UpdateLivesText(int lives)
    {
        if (livesText != null)
        {
            string hearts = "";
            for (int i = 0; i < lives; i++) hearts += "\u2764 ";
            livesText.text = hearts.TrimEnd();
        }
    }
}
