using System.Collections;
using UnityEngine;

public class SauceCollectible : MonoBehaviour
{
    [Header("Spin & Bob")]
    public float spinSpeed = 90f;
    public float bobHeight = 0.3f;
    public float bobSpeed = 2f;

    [Header("Value")]
    public int sauceValue = 1;

    [Header("Audio")]
    public AudioSource collectSound;

    private Vector3 startPosition;
    private bool collected = false;

    void Start()
    {
        startPosition = transform.position;
    }

    void Update()
    {
        if (collected) return;
        transform.Rotate(Vector3.up, spinSpeed * Time.deltaTime, Space.World);
        float newY = startPosition.y + Mathf.Sin(Time.time * bobSpeed) * bobHeight;
        transform.position = new Vector3(transform.position.x, newY, transform.position.z);
    }

    void OnTriggerEnter(Collider other)
    {
        if (collected) return;
        if (!other.CompareTag("Player")) return;

        collected = true;

        if (SauceManager.Instance != null)
            SauceManager.Instance.Collect(sauceValue);

        if (collectSound != null)
        {
            collectSound.transform.SetParent(null);
            collectSound.Play();
            Destroy(collectSound.gameObject, collectSound.clip != null ? collectSound.clip.length + 0.1f : 1f);
        }

        SpawnCollectParticles();
        Destroy(gameObject);
    }

    void SpawnCollectParticles()
    {
        GameObject psObj = new GameObject("CollectBurst");
        psObj.transform.position = transform.position;
        ParticleSystem ps = psObj.AddComponent<ParticleSystem>();

        var main = ps.main;
        main.loop = false;
        main.startColor = new ParticleSystem.MinMaxGradient(new Color(0.95f, 0.30f, 0.05f), new Color(0.95f, 0.55f, 0.10f));
        main.startSize = new ParticleSystem.MinMaxCurve(0.1f, 0.2f);
        main.startSpeed = new ParticleSystem.MinMaxCurve(2f, 4f);
        main.startLifetime = new ParticleSystem.MinMaxCurve(0.3f, 0.6f);
        main.gravityModifier = 0.3f;

        var emission = ps.emission;
        emission.rateOverTime = 0f;
        var burst = new ParticleSystem.Burst(0f, 12);
        emission.SetBursts(new ParticleSystem.Burst[] { burst });

        var shape = ps.shape;
        shape.shapeType = ParticleSystemShapeType.Sphere;
        shape.radius = 0.1f;

        ps.Play();
        Destroy(psObj, 2f);
    }
}
