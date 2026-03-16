using System.Collections;
using UnityEngine;
using UnityEngine.UI;

public class FalafelNPC : MonoBehaviour
{
    public enum State { Crying, Rescued, Done }
    public State currentState = State.Crying;

    [Header("Interaction")]
    public float interactRange = 2.5f;

    [Header("Sauce Reward")]
    public int sauceReward = 3;

    [Header("Audio")]
    public AudioSource happySound;

    [Header("Speech Bubble")]
    private GameObject speechBubble;
    private Text speechText;

    [Header("Particles")]
    private ParticleSystem tearParticles;

    private Transform player;
    private bool interactPromptShown = false;
    private GameObject falafelVisual;

    // Rescued bounce
    private Vector3 baseScale;
    private float bounceTimer = 0f;
    private float bounceDuration = 1.5f;

    void Start()
    {
        player = FindObjectOfType<PlayerController>(true)?.transform;

        baseScale = transform.localScale;
        HideExistingRenderers();
        SetupFalafelVisual();
        SetupTearParticles();
        SetupSpeechBubble();
        EnterState(currentState);
    }

    void HideExistingRenderers()
    {
        foreach (Renderer r in GetComponentsInChildren<Renderer>())
            r.enabled = false;
    }

    void SetupFalafelVisual()
    {
        if (falafelVisual != null) Object.Destroy(falafelVisual);

        if (currentState == State.Crying)
            falafelVisual = FalafelCharacterBuilder.BuildCryingFalafel(transform, 0.4f);
        else
            falafelVisual = FalafelCharacterBuilder.BuildRescuedFalafel(transform, 0.4f);
    }

    void SetupTearParticles()
    {
        GameObject psObj = new GameObject("TearParticles");
        psObj.transform.SetParent(transform, false);
        psObj.transform.localPosition = new Vector3(0f, 0.55f, 0f);

        tearParticles = psObj.AddComponent<ParticleSystem>();
        var main = tearParticles.main;
        main.loop = true;
        main.startColor = new ParticleSystem.MinMaxGradient(new Color(0.4f, 0.7f, 1f, 1f));
        main.startSize = new ParticleSystem.MinMaxCurve(0.05f, 0.1f);
        main.startSpeed = new ParticleSystem.MinMaxCurve(0.5f, 1.0f);
        main.startLifetime = new ParticleSystem.MinMaxCurve(0.4f, 0.8f);
        main.gravityModifier = 0.5f;

        var emission = tearParticles.emission;
        emission.rateOverTime = 8f;

        var shape = tearParticles.shape;
        shape.shapeType = ParticleSystemShapeType.Sphere;
        shape.radius = 0.1f;

        tearParticles.Stop();
    }

    void SetupSpeechBubble()
    {
        speechBubble = new GameObject("SpeechBubble");
        speechBubble.transform.SetParent(transform, false);
        speechBubble.transform.localPosition = new Vector3(0f, 1.0f, 0f);

        Canvas canvas = speechBubble.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.WorldSpace;
        speechBubble.AddComponent<CanvasScaler>();

        RectTransform rt = speechBubble.GetComponent<RectTransform>();
        rt.sizeDelta = new Vector2(2f, 0.6f);
        rt.localScale = Vector3.one * 0.01f;

        GameObject textObj = new GameObject("Text");
        textObj.transform.SetParent(speechBubble.transform, false);
        speechText = textObj.AddComponent<Text>();
        speechText.text = "Help me!";
        speechText.fontSize = 48;
        speechText.alignment = TextAnchor.MiddleCenter;
        speechText.color = new Color(0.25f, 0.13f, 0.04f);

        RectTransform textRt = textObj.GetComponent<RectTransform>();
        textRt.anchorMin = Vector2.zero;
        textRt.anchorMax = Vector2.one;
        textRt.offsetMin = Vector2.zero;
        textRt.offsetMax = Vector2.zero;

        Font font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        if (font != null) speechText.font = font;

        speechBubble.SetActive(false);
    }

    void EnterState(State s)
    {
        currentState = s;
        switch (s)
        {
            case State.Crying:
                tearParticles.Play();
                if (speechBubble != null) { speechBubble.SetActive(true); speechText.text = "Help me!"; }
                break;
            case State.Rescued:
                tearParticles.Stop();
                SetupFalafelVisual();
                if (speechBubble != null) { speechBubble.SetActive(true); speechText.text = "Thank you!"; }
                bounceTimer = 0f;
                if (happySound != null) happySound.Play();
                break;
            case State.Done:
                tearParticles.Stop();
                if (speechBubble != null) speechBubble.SetActive(false);
                break;
        }
    }

    public void TryRescue()
    {
        if (currentState != State.Crying) return;
        if (SauceManager.Instance != null)
            SauceManager.Instance.Collect(sauceReward);
        EnterState(State.Rescued);
    }

    void Update()
    {
        if (player == null) return;

        float dist = Vector3.Distance(transform.position, player.position);

        if (currentState == State.Crying)
        {
            if (dist <= interactRange)
            {
                if (!interactPromptShown) { interactPromptShown = true; }
            }
            else
            {
                interactPromptShown = false;
            }
        }
        else if (currentState == State.Rescued)
        {
            bounceTimer += Time.deltaTime;
            float t = Mathf.Sin(bounceTimer * 6f) * 0.15f * Mathf.Max(0f, 1f - bounceTimer / bounceDuration);
            transform.localScale = baseScale * (1f + t);

            if (speechBubble != null && Camera.main != null)
                speechBubble.transform.LookAt(speechBubble.transform.position + Camera.main.transform.forward);

            if (bounceTimer >= bounceDuration)
                EnterState(State.Done);
        }
    }

    void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.cyan;
        Gizmos.DrawWireSphere(transform.position, interactRange);
    }
}
