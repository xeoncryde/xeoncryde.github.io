using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class WinTrigger : MonoBehaviour
{
    public GameObject player;
    public GameObject winCanvas;
    public AudioSource cheeryMondayBGM;
    public AudioSource victoryPianoBGM;

    void Start()
    {
        // includeInactive: true so we find the controller even before the cutscene enables it
        PlayerController pc = FindObjectOfType<PlayerController>(true);
        if (pc != null) player = pc.gameObject;
        if (victoryPianoBGM != null) victoryPianoBGM.Stop();
    }

    void OnTriggerEnter(Collider other)
    {
        winCanvas.SetActive(true);
        if (player != null)
            player.GetComponent<PauseMenu>().enabled = false;
        if (cheeryMondayBGM != null) cheeryMondayBGM.Stop();
        if (victoryPianoBGM != null) victoryPianoBGM.Play();
        Time.timeScale = 0;
    }
}
