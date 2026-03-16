using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using UnityEngine.EventSystems;

public class MainMenu : MonoBehaviour
{
    [Header("Audio")]
    public AudioSource buttonRollover;
    public AudioSource buttonClick;

    // Colors
    private Color bgTop        = new Color(0.13f, 0.60f, 0.80f); // sky blue
    private Color bgBottom     = new Color(0.87f, 0.96f, 0.70f); // soft lime
    private Color panelColor   = new Color(1f, 0.93f, 0.70f, 0.97f); // warm cream
    private Color btnColor     = new Color(0.95f, 0.55f, 0.10f); // falafel orange
    private Color btnHover     = new Color(1f,  0.68f, 0.20f);
    private Color btnPressed   = new Color(0.80f, 0.42f, 0.05f);
    private Color titleColor   = new Color(0.25f, 0.10f, 0.02f);
    private Color subtitleColor= new Color(0.45f, 0.25f, 0.05f);
    private Color textColor    = new Color(1f, 0.97f, 0.88f);

    private GameObject mainPanel;
    private GameObject levelPanel;
    private Canvas rootCanvas;

    void Start()
    {
        rootCanvas = GetComponentInParent<Canvas>();
        if (rootCanvas == null) rootCanvas = FindObjectOfType<Canvas>();
        BuildMainMenu();
        BuildLevelSelect();
        ShowMain();
    }

    // ─── MAIN MENU ───────────────────────────────────────────────
    void BuildMainMenu()
    {
        mainPanel = new GameObject("MainMenuPanel");
        mainPanel.transform.SetParent(rootCanvas.transform, false);

        // Background image (gradient-ish solid)
        Image bg = mainPanel.AddComponent<Image>();
        bg.color = new Color(0.14f, 0.62f, 0.82f);
        RectTransform bgRT = mainPanel.GetComponent<RectTransform>();
        bgRT.anchorMin = Vector2.zero;
        bgRT.anchorMax = Vector2.one;
        bgRT.offsetMin = Vector2.zero;
        bgRT.offsetMax = Vector2.zero;

        // ── Card panel ──
        GameObject card = CreatePanel(mainPanel.transform, "Card",
            new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
            new Vector2(0, 20), new Vector2(500, 440), panelColor);

        // ── 🧆 emoji above title ──
        CreateText(card.transform, "Emoji", "🧆",
            new Vector2(0.5f, 1f), new Vector2(0.5f, 1f),
            new Vector2(0, -55), new Vector2(120, 90),
            80, titleColor);

        // ── Title ──
        Text title = CreateText(card.transform, "Title", "FALAFEL KINGDOM",
            new Vector2(0.5f, 1f), new Vector2(0.5f, 1f),
            new Vector2(0, -140), new Vector2(460, 70),
            42, titleColor);
        title.fontStyle = FontStyle.Bold;

        // ── Subtitle ──
        CreateText(card.transform, "Subtitle", "Help the falafels reclaim their hummus!",
            new Vector2(0.5f, 1f), new Vector2(0.5f, 1f),
            new Vector2(0, -200), new Vector2(420, 36),
            18, subtitleColor);

        // ── Divider ──
        CreateDivider(card.transform, new Vector2(0, -228), new Vector2(380, 3));

        // ── PLAY button ──
        GameObject playBtn = CreateButton(card.transform, "PlayButton", "▶  PLAY",
            new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
            new Vector2(0, 40), new Vector2(320, 64));
        playBtn.GetComponent<Button>().onClick.AddListener(() => { SFXClick(); ShowLevels(); });

        // ── OPTIONS button ──
        GameObject optBtn = CreateButton(card.transform, "OptionsButton", "⚙  OPTIONS",
            new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
            new Vector2(0, -36), new Vector2(320, 50), small: true);
        optBtn.GetComponent<Button>().onClick.AddListener(() => { SFXClick(); OptionsButton(); });

        // ── EXIT button ──
        GameObject exitBtn = CreateButton(card.transform, "ExitButton", "✕  EXIT",
            new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
            new Vector2(0, -100), new Vector2(320, 50), small: true);
        exitBtn.GetComponent<Button>().onClick.AddListener(() => { SFXClick(); Application.Quit(); });

        AddHoverSounds(mainPanel);
    }

    // ─── LEVEL SELECT ─────────────────────────────────────────────
    void BuildLevelSelect()
    {
        levelPanel = new GameObject("LevelSelectPanel");
        levelPanel.transform.SetParent(rootCanvas.transform, false);

        Image bg = levelPanel.AddComponent<Image>();
        bg.color = new Color(0.14f, 0.62f, 0.82f);
        RectTransform bgRT = levelPanel.GetComponent<RectTransform>();
        bgRT.anchorMin = Vector2.zero;
        bgRT.anchorMax = Vector2.one;
        bgRT.offsetMin = Vector2.zero;
        bgRT.offsetMax = Vector2.zero;

        // Card
        GameObject card = CreatePanel(levelPanel.transform, "Card",
            new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
            new Vector2(0, 20), new Vector2(560, 420), panelColor);

        // Title
        Text title = CreateText(card.transform, "Title", "SELECT A LEVEL",
            new Vector2(0.5f, 1f), new Vector2(0.5f, 1f),
            new Vector2(0, -60), new Vector2(460, 60),
            36, titleColor);
        title.fontStyle = FontStyle.Bold;

        // Divider
        CreateDivider(card.transform, new Vector2(0, -102), new Vector2(460, 3));

        // Level buttons
        string[] names = { "1  The Market", "2  The Bazaar", "3  The Palace" };
        float[] yPos = { 30, -50, -130 };
        for (int i = 0; i < 3; i++)
        {
            int sceneIndex = i + 1;
            GameObject btn = CreateButton(card.transform, "Level" + (i+1), "🧆  " + names[i],
                new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
                new Vector2(0, yPos[i]), new Vector2(400, 64));
            btn.GetComponent<Button>().onClick.AddListener(() => { SFXClick(); LoadLevel(sceneIndex); });
        }

        // Back button
        GameObject backBtn = CreateButton(card.transform, "BackButton", "←  BACK",
            new Vector2(0.5f, 0f), new Vector2(0.5f, 0f),
            new Vector2(0, 40), new Vector2(200, 44), small: true);
        backBtn.GetComponent<Button>().onClick.AddListener(() => { SFXClick(); ShowMain(); });

        AddHoverSounds(levelPanel);
        levelPanel.SetActive(false);
    }

    // ─── NAVIGATION ───────────���───────────────────────────────────
    void ShowMain()  { mainPanel.SetActive(true);  levelPanel.SetActive(false); }
    void ShowLevels(){ mainPanel.SetActive(false); levelPanel.SetActive(true);  }

    void LoadLevel(int index) { SceneManager.LoadScene(index); }

    void OptionsButton()
    {
        PlayerPrefs.SetString("previous-scene", SceneManager.GetActiveScene().name);
        SceneManager.LoadScene("Options");
    }

    // ─── AUDIO ────────────────────────────────────────────────────
    void SFXClick()  { if (buttonClick    != null) buttonClick.Play(); }
    void SFXHover()  { if (buttonRollover != null) buttonRollover.Play(); }

    void AddHoverSounds(GameObject root)
    {
        foreach (Button b in root.GetComponentsInChildren<Button>())
        {
            EventTrigger et = b.gameObject.AddComponent<EventTrigger>();
            var entry = new EventTrigger.Entry();
            entry.eventID = EventTriggerType.PointerEnter;
            entry.callback.AddListener(_ => SFXHover());
            et.triggers.Add(entry);
        }
    }

    // ─── UI HELPERS ───────────────────────────────────────────────
    GameObject CreatePanel(Transform parent, string name,
        Vector2 anchorMin, Vector2 anchorMax,
        Vector2 anchoredPos, Vector2 size, Color color)
    {
        GameObject go = new GameObject(name);
        go.transform.SetParent(parent, false);
        Image img = go.AddComponent<Image>();
        img.color = color;
        RectTransform rt = go.GetComponent<RectTransform>();
        rt.anchorMin = anchorMin;
        rt.anchorMax = anchorMax;
        rt.anchoredPosition = anchoredPos;
        rt.sizeDelta = size;
        return go;
    }

    Text CreateText(Transform parent, string name, string content,
        Vector2 anchorMin, Vector2 anchorMax,
        Vector2 anchoredPos, Vector2 size,
        int fontSize, Color color)
    {
        GameObject go = new GameObject(name);
        go.transform.SetParent(parent, false);
        Text t = go.AddComponent<Text>();
        t.text = content;
        t.fontSize = fontSize;
        t.color = color;
        t.alignment = TextAnchor.MiddleCenter;
        t.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        t.horizontalOverflow = HorizontalWrapMode.Overflow;
        t.verticalOverflow = VerticalWrapMode.Overflow;
        RectTransform rt = go.GetComponent<RectTransform>();
        rt.anchorMin = anchorMin;
        rt.anchorMax = anchorMax;
        rt.anchoredPosition = anchoredPos;
        rt.sizeDelta = size;
        return t;
    }

    void CreateDivider(Transform parent, Vector2 anchoredPos, Vector2 size)
    {
        GameObject go = new GameObject("Divider");
        go.transform.SetParent(parent, false);
        Image img = go.AddComponent<Image>();
        img.color = new Color(0.80f, 0.65f, 0.35f, 0.6f);
        RectTransform rt = go.GetComponent<RectTransform>();
        rt.anchorMin = new Vector2(0.5f, 0.5f);
        rt.anchorMax = new Vector2(0.5f, 0.5f);
        rt.anchoredPosition = anchoredPos;
        rt.sizeDelta = size;
    }

    GameObject CreateButton(Transform parent, string name, string label,
        Vector2 anchorMin, Vector2 anchorMax,
        Vector2 anchoredPos, Vector2 size, bool small = false)
    {
        GameObject go = new GameObject(name);
        go.transform.SetParent(parent, false);
        Image img = go.AddComponent<Image>();
        img.color = btnColor;
        Button btn = go.AddComponent<Button>();
        ColorBlock cb = btn.colors;
        cb.normalColor    = btnColor;
        cb.highlightedColor = btnHover;
        cb.pressedColor   = btnPressed;
        cb.selectedColor  = btnColor;
        btn.colors = cb;
        RectTransform rt = go.GetComponent<RectTransform>();
        rt.anchorMin = anchorMin;
        rt.anchorMax = anchorMax;
        rt.anchoredPosition = anchoredPos;
        rt.sizeDelta = size;

        // Label
        GameObject labelGO = new GameObject("Text");
        labelGO.transform.SetParent(go.transform, false);
        Text t = labelGO.AddComponent<Text>();
        t.text = label;
        t.fontSize = small ? 20 : 26;
        t.fontStyle = FontStyle.Bold;
        t.color = textColor;
        t.alignment = TextAnchor.MiddleCenter;
        t.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        RectTransform trt = labelGO.GetComponent<RectTransform>();
        trt.anchorMin = Vector2.zero;
        trt.anchorMax = Vector2.one;
        trt.offsetMin = Vector2.zero;
        trt.offsetMax = Vector2.zero;

        return go;
    }
}