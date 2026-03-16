using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;

public class UIThemeApplier : MonoBehaviour
{
    // Maps old strings to new Falafel Kingdom strings
    private Dictionary<string, string> textReplacements = new Dictionary<string, string>
    {
        { "3D Platformer", "Falafel Kingdom" },
        { "Level 1", "The Market" },
        { "Level 2", "The Bazaar" },
        { "Level 3", "The Palace" },
        { "Play", "Play \U0001f9c6" },
        { "Main Menu", "Main Menu" },
        { "Resume", "Resume" },
        { "Restart", "Restart" },
        { "Quit", "Quit" },
        { "Next Level", "Next Level \u2192" },
        { "Options", "Options" },
        { "Timer", "\U0001f9c6 Time" }
    };

    void Start()
    {
        Text[] allTexts = FindObjectsOfType<Text>(true);
        foreach (Text t in allTexts)
        {
            foreach (var kvp in textReplacements)
            {
                if (t.text.Contains(kvp.Key))
                {
                    t.text = t.text.Replace(kvp.Key, kvp.Value);
                }
            }
        }
    }
}
