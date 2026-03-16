using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// FalafelCharacterSetup - Procedurally builds a falafel-ball themed character
/// by hiding the boy mesh renderers and replacing them with falafel-coloured primitives.
/// Attach this to the "ty" child GameObject (the one that has the SkinnedMeshRenderers).
/// </summary>
public class FalafelCharacterSetup : MonoBehaviour
{
    [Header("Falafel Colours")]
    public Color falafelBodyColor  = new Color(0.72f, 0.55f, 0.22f);   // warm golden-brown
    public Color falafelCrustColor = new Color(0.55f, 0.38f, 0.12f);   // darker crust patches
    public Color sesameColor       = new Color(0.96f, 0.90f, 0.72f);   // sesame seeds
    public Color eyeColor          = new Color(0.15f, 0.08f, 0.02f);   // dark-brown eyes
    public Color mouthColor        = new Color(0.85f, 0.10f, 0.10f);   // sauce red mouth

    // Names of SkinnedMeshRenderer objects to hide (the boy meshes)
    private static readonly string[] BoyMeshNames =
    {
        "Boy01_Head_Geo", "Boy01_Hands_Geo", "Boy01_UpperBody_Geo",
        "Boy01_LowerBody_Geo", "Boy01_Shoes_Geo", "Boy01_Scarf_Geo", "Boy01_Hair_Geo"
    };

    private List<GameObject> spawnedParts = new List<GameObject>();

    void Start()
    {
        HideBoyMeshes();
        BuildFalafelCharacter();
    }

    // ─── Hide the original boy SkinnedMeshRenderers ───────────────────────────
    void HideBoyMeshes()
    {
        SkinnedMeshRenderer[] renderers = GetComponentsInChildren<SkinnedMeshRenderer>(true);
        foreach (var smr in renderers)
        {
            foreach (string meshName in BoyMeshNames)
            {
                if (smr.gameObject.name.Contains(meshName))
                {
                    smr.enabled = false;
                    break;
                }
            }
        }
    }

    // ─── Build the falafel-ball character from primitives ─────────────────────
    void BuildFalafelCharacter()
    {
        // --- Main body ---
        GameObject body = CreatePrimitive(PrimitiveType.Sphere, "FalafelBody",
            Vector3.up * 0.5f, Vector3.one * 0.72f, falafelBodyColor);
        spawnedParts.Add(body);

        // --- Crust patches (darker blobs on the surface) ---
        Vector3[] patchOffsets =
        {
            new Vector3( 0.22f,  0.60f,  0.15f),
            new Vector3(-0.20f,  0.50f, -0.18f),
            new Vector3( 0.05f,  0.30f,  0.32f),
            new Vector3(-0.28f,  0.40f,  0.10f),
            new Vector3( 0.30f,  0.42f, -0.05f),
        };
        foreach (var offset in patchOffsets)
        {
            var patch = CreatePrimitive(PrimitiveType.Sphere, "FalafelCrust",
                offset, Vector3.one * 0.14f, falafelCrustColor);
            patch.transform.SetParent(body.transform.parent, true);
            spawnedParts.Add(patch);
        }

        // --- Sesame seeds (tiny bright spheres scattered on body) ---
        System.Random rng = new System.Random(42); // deterministic seed
        for (int i = 0; i < 14; i++)
        {
            float theta = (float)(rng.NextDouble() * Mathf.PI * 2f);
            float phi   = (float)(rng.NextDouble() * Mathf.PI);
            float r = 0.36f;
            Vector3 pos = new Vector3(
                r * Mathf.Sin(phi) * Mathf.Cos(theta),
                0.5f + r * Mathf.Cos(phi),
                r * Mathf.Sin(phi) * Mathf.Sin(theta));
            var seed = CreatePrimitive(PrimitiveType.Sphere, "Sesame_" + i,
                pos, Vector3.one * 0.05f, sesameColor);
            seed.transform.SetParent(body.transform.parent, true);
            spawnedParts.Add(seed);
        }

        // --- Eyes ---
        Vector3 eyeBasePos = new Vector3(0f, 0.72f, 0.28f);
        for (int i = -1; i <= 1; i += 2)
        {
            var eye = CreatePrimitive(PrimitiveType.Sphere, "Eye",
                eyeBasePos + Vector3.right * i * 0.09f,
                Vector3.one * 0.07f, eyeColor);
            eye.transform.SetParent(body.transform.parent, true);
            spawnedParts.Add(eye);
        }

        // --- Mouth (small flattened red sphere) ---
        var mouth = CreatePrimitive(PrimitiveType.Sphere, "Mouth",
            new Vector3(0f, 0.58f, 0.33f),
            new Vector3(0.14f, 0.04f, 0.06f), mouthColor);
        mouth.transform.SetParent(body.transform.parent, true);
        spawnedParts.Add(mouth);
    }

    // ─── Helper: create a primitive, set position & scale, set colour ─────────
    GameObject CreatePrimitive(PrimitiveType type, string goName,
        Vector3 localPosition, Vector3 localScale, Color color)
    {
        GameObject go = GameObject.CreatePrimitive(type);
        go.name = goName;
        go.transform.SetParent(transform, false);
        go.transform.localPosition = localPosition;
        go.transform.localScale    = localScale;

        // Remove collider – we don't want extra physics colliders
        Collider col = go.GetComponent<Collider>();
        if (col != null) Destroy(col);

        // Apply colour via a simple material
        Renderer rend = go.GetComponent<Renderer>();
        if (rend != null)
        {
            Material mat = new Material(Shader.Find("Standard"));
            mat.color = color;
            // Make the falafel surface look slightly rough
            mat.SetFloat("_Glossiness", 0.15f);
            mat.SetFloat("_Metallic", 0.0f);
            rend.material = mat;
        }

        return go;
    }

    void OnDestroy()
    {
        foreach (var part in spawnedParts)
            if (part != null) Destroy(part);
    }
}