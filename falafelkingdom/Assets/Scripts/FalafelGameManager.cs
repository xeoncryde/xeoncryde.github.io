using UnityEngine;

public class FalafelGameManager : MonoBehaviour
{
    public GameObject winCanvas;
    public AudioSource levelBGM;
    public AudioSource victoryBGM;

    private bool triggered = false;

    void Update()
    {
        if (triggered)
            return;

        FalafelNPC[] npcs = FindObjectsOfType<FalafelNPC>();
        if (npcs.Length == 0)
            return;

        foreach (FalafelNPC npc in npcs)
        {
            if (npc.currentState != FalafelNPC.State.Done)
                return;
        }

        triggered = true;
        TriggerWin();
    }

    void TriggerWin()
    {
        if (winCanvas != null)
            winCanvas.SetActive(true);
        if (levelBGM != null)
            levelBGM.Stop();
        if (victoryBGM != null)
            victoryBGM.Play();
        Time.timeScale = 0;
    }

    void OnDestroy()
    {
        if (triggered)
            Time.timeScale = 1;
    }
}