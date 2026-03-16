using System.Collections;
using UnityEngine;

public class FalafelNPC : MonoBehaviour
{
    public enum State { Idle, Requesting, Done }
    public State currentState = State.Idle;

    public int sauceCost = 1;
    public float detectionRadius = 3f;
    public GameObject promptUI;
    public GameObject pathToUnlock;
    public ParticleSystem celebrationFX;
    public Animator npcAnimator;

    private Transform player;

    void Start()
    {
        GameObject playerObj = GameObject.FindGameObjectWithTag("Player");
        if (playerObj != null)
            player = playerObj.transform;

        if (promptUI != null)
            promptUI.SetActive(false);
    }

    void Update()
    {
        if (player == null || currentState == State.Done)
            return;

        float dist = Vector3.Distance(transform.position, player.position);

        if (currentState == State.Idle && dist <= detectionRadius)
        {
            currentState = State.Requesting;
            if (promptUI != null)
                promptUI.SetActive(true);
        }
        else if (currentState == State.Requesting && dist > detectionRadius)
        {
            currentState = State.Idle;
            if (promptUI != null)
                promptUI.SetActive(false);
        }
    }

    public void TryInteract()
    {
        if (currentState == State.Requesting && SauceManager.Instance != null && SauceManager.Instance.TrySpend(sauceCost))
            StartCoroutine(Activate());
    }

    private IEnumerator Activate()
    {
        currentState = State.Done;
        if (promptUI != null)
            promptUI.SetActive(false);
        if (npcAnimator != null)
            npcAnimator.SetTrigger("Celebrate");
        if (celebrationFX != null)
            celebrationFX.Play();
        yield return new WaitForSeconds(1f);
        if (pathToUnlock != null)
            pathToUnlock.SetActive(true);
    }
}
