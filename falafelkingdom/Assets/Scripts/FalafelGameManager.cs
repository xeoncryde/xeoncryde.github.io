using System.Linq;
using UnityEngine;
using UnityEngine.SceneManagement;

public class FalafelGameManager : MonoBehaviour
{
    [Header("Win Condition")]
    public bool autoDetectNPCs = true;
    private FalafelNPC[] npcs;

    [Header("Win UI")]
    public GameObject winCanvas;

    void Start()
    {
        if (autoDetectNPCs)
            npcs = FindObjectsOfType<FalafelNPC>();
    }

    void Update()
    {
        if (npcs == null || npcs.Length == 0) return;

        bool allDone = npcs.All(n => n.currentState == FalafelNPC.State.Done);
        if (allDone)
        {
            TriggerWin();
            enabled = false;
        }
    }

    void TriggerWin()
    {
        if (winCanvas != null)
            winCanvas.SetActive(true);

        Time.timeScale = 0f;
    }
}
