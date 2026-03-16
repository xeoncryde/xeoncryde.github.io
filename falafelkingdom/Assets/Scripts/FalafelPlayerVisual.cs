using UnityEngine;

/// <summary>
/// Replaces the humanoid "ty" model with a procedural falafel-ball visual.
/// Adds movement-driven squash/stretch, bobbing, and tilt animation.
/// </summary>
public class FalafelPlayerVisual : MonoBehaviour
{
    private GameObject falafelVisual;
    private CharacterController controller;
    private Vector3 lastPosition;
    private float bobPhase;
    private float squashVel;
    private float currentSquash;

    void Start()
    {
        controller = GetComponent<CharacterController>();

        // Hide the humanoid model renderers (keep Animator functional)
        Transform tyModel = transform.Find("ty");
        if (tyModel != null)
        {
            foreach (Renderer r in tyModel.GetComponentsInChildren<Renderer>())
                r.enabled = false;
        }

        // Build the falafel visual
        falafelVisual = FalafelCharacterBuilder.BuildPlayerFalafel(transform, 0.5f);
        falafelVisual.transform.localPosition = Vector3.zero;

        lastPosition = transform.position;
    }

    void LateUpdate()
    {
        if (falafelVisual == null || controller == null) return;

        Vector3 velocity = (transform.position - lastPosition) / Mathf.Max(Time.deltaTime, 0.001f);
        lastPosition = transform.position;

        float hSpeed = new Vector3(velocity.x, 0, velocity.z).magnitude;

        // ── Squash & Stretch ──────────────────────────────────
        float targetSquash = 0f;
        if (!controller.isGrounded && velocity.y < -2f)
            targetSquash = Mathf.Clamp01(Mathf.Abs(velocity.y) / 15f) * 0.18f;

        currentSquash = Mathf.SmoothDamp(currentSquash, targetSquash, ref squashVel, 0.08f);

        float sY = 1f - currentSquash;
        float sXZ = 1f + currentSquash * 0.5f;
        falafelVisual.transform.localScale = new Vector3(sXZ, sY, sXZ);

        // ── Idle / Run Bob ────────────────────────────────────
        if (hSpeed > 0.5f && controller.isGrounded)
        {
            bobPhase += Time.deltaTime * hSpeed * 1.4f;
            float bob = Mathf.Sin(bobPhase * 2f) * 0.04f;
            falafelVisual.transform.localPosition = new Vector3(0, bob, 0);
        }
        else
        {
            falafelVisual.transform.localPosition = Vector3.Lerp(
                falafelVisual.transform.localPosition, Vector3.zero, Time.deltaTime * 5f);
        }

        // ── Tilt in Movement Direction ────────────────────────
        if (hSpeed > 0.5f)
        {
            Vector3 dir = new Vector3(velocity.x, 0, velocity.z).normalized;
            Vector3 localDir = transform.InverseTransformDirection(dir);
            float tiltZ = -localDir.x * 12f;
            float tiltX = localDir.z * 8f;
            falafelVisual.transform.localRotation = Quaternion.Lerp(
                falafelVisual.transform.localRotation,
                Quaternion.Euler(tiltX, 0, tiltZ),
                Time.deltaTime * 6f);
        }
        else
        {
            falafelVisual.transform.localRotation = Quaternion.Lerp(
                falafelVisual.transform.localRotation,
                Quaternion.identity,
                Time.deltaTime * 4f);
        }
    }
}
