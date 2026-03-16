using System;
using UnityEngine;
using UnityEngine.Events;

public class SauceManager : MonoBehaviour
{
    public static SauceManager Instance { get; private set; }

    [Header("Sauce")]
    public int sauce = 10;
    public int maxSauce = 30;

    [Header("Lives")]
    public int lives = 3;

    [Header("Events")]
    public UnityEvent<int> OnSauceChanged;
    public UnityEvent<int> OnLivesChanged;

    public static event Action<int> SauceChanged;
    public static event Action<int> LivesChanged;
    public static event Action GameOverTriggered;

    void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
    }

    void OnDestroy()
    {
        if (Instance == this) Instance = null;
    }

    public void Collect(int amount)
    {
        sauce = Mathf.Clamp(sauce + amount, 0, maxSauce);

        OnSauceChanged?.Invoke(sauce);
        SauceChanged?.Invoke(sauce);

        if (sauce == 0 && amount < 0)
            LoseLife();
    }

    void LoseLife()
    {
        lives--;
        OnLivesChanged?.Invoke(lives);
        LivesChanged?.Invoke(lives);

        if (lives <= 0)
        {
            GameOverTriggered?.Invoke();
        }
        else
        {
            sauce = maxSauce / 2;
            OnSauceChanged?.Invoke(sauce);
            SauceChanged?.Invoke(sauce);
        }
    }
}
