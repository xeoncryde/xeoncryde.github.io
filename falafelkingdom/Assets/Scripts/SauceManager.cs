using UnityEngine;
using UnityEngine.UI;

public class SauceManager : MonoBehaviour
{
    public static SauceManager Instance;

    public int currentSauce = 0;
    public int maxSauce = 10;
    public Text sauceCounterText;

    void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
    }

    public bool TrySpend(int amount)
    {
        if (currentSauce >= amount)
        {
            currentSauce -= amount;
            UpdateUI();
            return true;
        }
        return false;
    }

    public void Collect(int amount)
    {
        currentSauce = Mathf.Min(currentSauce + amount, maxSauce);
        UpdateUI();
    }

    private void UpdateUI()
    {
        if (sauceCounterText != null)
            sauceCounterText.text = "\U0001f9c6 x" + currentSauce;
    }
}
