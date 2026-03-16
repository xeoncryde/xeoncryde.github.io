#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;

namespace FalafelKingdom.Editor
{
    public static class MainMenuBuilder
    {
        [MenuItem("Tools/Falafel Kingdom/Build Main Menu Scene")]
        public static void BuildMainMenuScene()
        {
            // Open or create the MainMenu scene
            string scenePath = "Assets/Scenes/MainMenu.unity";
            UnityEditor.SceneManagement.EditorSceneManager.NewScene(
                UnityEditor.SceneManagement.NewSceneSetup.EmptyScene,
                UnityEditor.SceneManagement.NewSceneMode.Single);

            // Load fonts
            Font mainFont = AssetDatabase.LoadAssetAtPath<Font>("Assets/Fonts/Kenney Future.ttf");
            if (mainFont == null)
                mainFont = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");

            // Create EventSystem
            if (Object.FindObjectOfType<EventSystem>() == null)
            {
                GameObject esObj = new GameObject("EventSystem");
                esObj.AddComponent<EventSystem>();
                esObj.AddComponent<StandaloneInputModule>();
            }

            // Create Canvas
            GameObject canvasObj = new GameObject("MainMenuCanvas");
            Canvas canvas = canvasObj.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            CanvasScaler scaler = canvasObj.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            canvasObj.AddComponent<GraphicRaycaster>();

            // MenuManager GameObject with MainMenu script
            GameObject menuManager = new GameObject("MenuManager");
            MainMenu mainMenuScript = menuManager.AddComponent<MainMenu>();

            // Audio sources
            AudioSource rollover = menuManager.AddComponent<AudioSource>();
            rollover.playOnAwake = false;
            AudioSource clickSfx = menuManager.AddComponent<AudioSource>();
            clickSfx.playOnAwake = false;
            mainMenuScript.buttonRollover = rollover;
            mainMenuScript.buttonClick = clickSfx;

            // ─── Main Menu Panel ───────────────────────────────────────────
            GameObject mainPanel = CreatePanel(canvasObj.transform, "MainMenuPanel",
                new Color(0.98f, 0.91f, 0.73f));

            // Title
            CreateText(mainPanel.transform, "Title", "FALAFEL KINGDOM",
                mainFont, 90, new Color(0.25f, 0.13f, 0.04f), TextAnchor.MiddleCenter,
                new Vector2(0.1f, 0.65f), new Vector2(0.9f, 0.92f));

            // Subtitle
            CreateText(mainPanel.transform, "Subtitle", "\U0001f9c6 A Kind Kingdom Adventure",
                mainFont, 38, new Color(0.6f, 0.35f, 0.10f), TextAnchor.MiddleCenter,
                new Vector2(0.15f, 0.55f), new Vector2(0.85f, 0.68f));

            // PLAY button
            GameObject playBtn = CreateButton(mainPanel.transform, "PlayButton", "PLAY",
                mainFont, new Color(0.95f, 0.55f, 0.10f), new Color(0.25f, 0.13f, 0.04f),
                new Vector2(0.35f, 0.35f), new Vector2(0.65f, 0.52f));
            playBtn.GetComponent<Button>().onClick.AddListener(mainMenuScript.PlayGame);

            // QUIT button
            GameObject quitBtn = CreateButton(mainPanel.transform, "QuitButton", "QUIT",
                mainFont, new Color(0.95f, 0.55f, 0.10f), new Color(0.25f, 0.13f, 0.04f),
                new Vector2(0.35f, 0.15f), new Vector2(0.65f, 0.32f));
            quitBtn.GetComponent<Button>().onClick.AddListener(mainMenuScript.QuitGame);

            mainMenuScript.mainMenuPanel = mainPanel;

            // ─── Level Select Panel ────────────────────────────────────────
            GameObject levelPanel = CreatePanel(canvasObj.transform, "LevelSelectPanel",
                new Color(0.98f, 0.91f, 0.73f));

            CreateText(levelPanel.transform, "Title", "SELECT LEVEL",
                mainFont, 72, new Color(0.25f, 0.13f, 0.04f), TextAnchor.MiddleCenter,
                new Vector2(0.1f, 0.75f), new Vector2(0.9f, 0.95f));

            // Level buttons
            string[] levelNames = { "Level01", "Level02", "Level03" };
            string[] levelLabels = { "Level 1", "Level 2", "Level 3" };
            float[] btnYMin = { 0.52f, 0.33f, 0.14f };
            float[] btnYMax = { 0.70f, 0.51f, 0.32f };

            for (int i = 0; i < 3; i++)
            {
                string levelName = levelNames[i];
                GameObject lvlBtn = CreateButton(levelPanel.transform, levelLabels[i] + "Button",
                    levelLabels[i], mainFont,
                    new Color(0.95f, 0.55f, 0.10f), new Color(0.25f, 0.13f, 0.04f),
                    new Vector2(0.3f, btnYMin[i]), new Vector2(0.7f, btnYMax[i]));
                string captured = levelName;
                lvlBtn.GetComponent<Button>().onClick.AddListener(() => mainMenuScript.LoadLevel(captured));
            }

            // BACK button
            GameObject backBtn = CreateButton(levelPanel.transform, "BackButton", "BACK",
                mainFont, new Color(0.82f, 0.62f, 0.28f), new Color(0.25f, 0.13f, 0.04f),
                new Vector2(0.1f, 0.02f), new Vector2(0.3f, 0.12f));
            backBtn.GetComponent<Button>().onClick.AddListener(mainMenuScript.BackToMain);

            mainMenuScript.levelSelectPanel = levelPanel;
            levelPanel.SetActive(false);

            // Save the scene
            EditorSceneManager.SaveScene(EditorSceneManager.GetActiveScene(), scenePath);
            Debug.Log("[FalafelKingdom] Main Menu scene built and saved to " + scenePath);
        }

        static GameObject CreatePanel(Transform parent, string name, Color bgColor)
        {
            GameObject obj = new GameObject(name);
            obj.transform.SetParent(parent, false);
            Image img = obj.AddComponent<Image>();
            img.color = bgColor;
            RectTransform rt = obj.GetComponent<RectTransform>();
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = Vector2.one;
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;
            return obj;
        }

        static void CreateText(Transform parent, string name, string content,
            Font font, int size, Color color, TextAnchor anchor,
            Vector2 anchorMin, Vector2 anchorMax)
        {
            GameObject obj = new GameObject(name);
            obj.transform.SetParent(parent, false);
            Text t = obj.AddComponent<Text>();
            t.text = content;
            t.font = font;
            t.fontSize = size;
            t.color = color;
            t.alignment = anchor;
            t.resizeTextForBestFit = false;
            RectTransform rt = obj.GetComponent<RectTransform>();
            rt.anchorMin = anchorMin;
            rt.anchorMax = anchorMax;
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;
        }

        static GameObject CreateButton(Transform parent, string name, string label,
            Font font, Color bgColor, Color textColor, Vector2 anchorMin, Vector2 anchorMax)
        {
            GameObject obj = new GameObject(name);
            obj.transform.SetParent(parent, false);
            Image img = obj.AddComponent<Image>();
            img.color = bgColor;
            Button btn = obj.AddComponent<Button>();
            ColorBlock colors = btn.colors;
            colors.highlightedColor = new Color(bgColor.r * 1.15f, bgColor.g * 1.15f, bgColor.b * 0.85f);
            colors.pressedColor = new Color(bgColor.r * 0.8f, bgColor.g * 0.8f, bgColor.b * 0.8f);
            btn.colors = colors;
            RectTransform rt = obj.GetComponent<RectTransform>();
            rt.anchorMin = anchorMin;
            rt.anchorMax = anchorMax;
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;

            // Label text
            GameObject textObj = new GameObject("Label");
            textObj.transform.SetParent(obj.transform, false);
            Text t = textObj.AddComponent<Text>();
            t.text = label;
            t.font = font;
            t.fontSize = 40;
            t.color = textColor;
            t.alignment = TextAnchor.MiddleCenter;
            RectTransform tRt = textObj.GetComponent<RectTransform>();
            tRt.anchorMin = Vector2.zero;
            tRt.anchorMax = Vector2.one;
            tRt.offsetMin = Vector2.zero;
            tRt.offsetMax = Vector2.zero;

            return obj;
        }
    }
}
#endif
