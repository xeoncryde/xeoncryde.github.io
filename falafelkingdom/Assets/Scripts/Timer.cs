using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

// Timer removed — this class is kept as a stub so existing scene references compile.
public class Timer : MonoBehaviour
{
    public Text timerText;
    public GameObject winCanvas;

    void Start()
    {
        enabled = false;
    }

    public void Win() { }
}
