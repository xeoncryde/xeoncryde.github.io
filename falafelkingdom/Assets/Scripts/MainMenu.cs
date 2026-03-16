using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using UnityEngine.EventSystems;

public class MainMenu : MonoBehaviour
{
    [Header("Panels")]
    public GameObject mainMenuPanel;
    public GameObject levelSelectPanel;

    [Header("Button Sounds")]
    public AudioSource buttonRollover;
    public AudioSource buttonClick;

    void Start()
    {
        if (mainMenuPanel != null) mainMenuPanel.SetActive(true);
        if (levelSelectPanel != null) levelSelectPanel.SetActive(false);

        RegisterButtonSounds();
    }

    void RegisterButtonSounds()
    {
        Button[] buttons = GetComponentsInChildren<Button>(true);
        foreach (Button btn in buttons)
        {
            EventTrigger et = btn.gameObject.GetComponent<EventTrigger>();
            if (et == null) et = btn.gameObject.AddComponent<EventTrigger>();

            EventTrigger.Entry hover = new EventTrigger.Entry();
            hover.eventID = EventTriggerType.PointerEnter;
            hover.callback.AddListener((d) => OnButtonHover());
            et.triggers.Add(hover);

            EventTrigger.Entry click = new EventTrigger.Entry();
            click.eventID = EventTriggerType.PointerDown;
            click.callback.AddListener((d) => OnButtonClick());
            et.triggers.Add(click);
        }
    }

    public void PlayGame()
    {
        if (mainMenuPanel != null) mainMenuPanel.SetActive(false);
        if (levelSelectPanel != null) levelSelectPanel.SetActive(true);
    }

    public void BackToMain()
    {
        if (levelSelectPanel != null) levelSelectPanel.SetActive(false);
        if (mainMenuPanel != null) mainMenuPanel.SetActive(true);
    }

    public void LoadLevel(string sceneName)
    {
        SceneManager.LoadScene(sceneName);
    }

    public void QuitGame()
    {
        Debug.Log("Quitting Falafel Kingdom");
        Application.Quit();
    }

    public void OnButtonHover()
    {
        if (buttonRollover != null) buttonRollover.Play();
    }

    public void OnButtonClick()
    {
        if (buttonClick != null) buttonClick.Play();
    }
}
