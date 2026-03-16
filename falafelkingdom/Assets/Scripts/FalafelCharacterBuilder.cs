using UnityEngine;

/// <summary>
/// Procedurally builds falafel-ball character visuals using Unity primitives.
/// Each character is a round golden-brown falafel with cartoon facial features.
/// </summary>
public static class FalafelCharacterBuilder
{
    // ── Color Palette ─────────────────────────────────────────
    static readonly Color GoldBody       = new Color(0.82f, 0.60f, 0.22f);
    static readonly Color GoldCrust      = new Color(0.70f, 0.48f, 0.16f);
    static readonly Color PaleBody       = new Color(0.75f, 0.65f, 0.42f);
    static readonly Color PaleCrust      = new Color(0.62f, 0.52f, 0.32f);
    static readonly Color RescuedBody    = new Color(0.90f, 0.70f, 0.28f);
    static readonly Color EyeWhite       = new Color(0.97f, 0.97f, 0.99f);
    static readonly Color Pupil          = new Color(0.07f, 0.05f, 0.05f);
    static readonly Color Highlight      = Color.white;
    static readonly Color BlushPink      = new Color(0.95f, 0.48f, 0.48f, 0.55f);
    static readonly Color MouthDark      = new Color(0.32f, 0.16f, 0.06f);
    static readonly Color TearBlue       = new Color(0.42f, 0.72f, 0.98f, 0.75f);
    static readonly Color LegBrown       = new Color(0.68f, 0.48f, 0.16f);
    static readonly Color EnemyRed       = new Color(0.72f, 0.10f, 0.06f);
    static readonly Color EnemyDark      = new Color(0.48f, 0.06f, 0.03f);
    static readonly Color HornYellow     = new Color(0.95f, 0.82f, 0.12f);

    // ── Public Builders ───────────────────────────────────────

    /// <summary>Build a golden player falafel with happy face, blush, and legs.</summary>
    public static GameObject BuildPlayerFalafel(Transform parent, float radius = 0.5f)
    {
        GameObject root = new GameObject("FalafelVisual");
        root.transform.SetParent(parent, false);
        root.transform.localPosition = Vector3.zero;

        CreateBody(root.transform, GoldBody, GoldCrust, radius);
        CreateEyes(root.transform, radius, EyeStyle.Happy);
        CreateSmile(root.transform, radius);
        CreateBlush(root.transform, radius);
        CreateLegs(root.transform, radius, LegBrown);

        return root;
    }

    /// <summary>Build a pale crying falafel with sad face and tear streaks.</summary>
    public static GameObject BuildCryingFalafel(Transform parent, float radius = 0.4f)
    {
        GameObject root = new GameObject("CryingFalafelVisual");
        root.transform.SetParent(parent, false);
        root.transform.localPosition = Vector3.zero;

        CreateBody(root.transform, PaleBody, PaleCrust, radius);
        CreateEyes(root.transform, radius, EyeStyle.Sad);
        CreateFrown(root.transform, radius);
        CreateTearStreaks(root.transform, radius);
        CreateLegs(root.transform, radius, new Color(0.58f, 0.45f, 0.28f));

        return root;
    }

    /// <summary>Build a happy rescued falafel (brighter, smiling).</summary>
    public static GameObject BuildRescuedFalafel(Transform parent, float radius = 0.4f)
    {
        GameObject root = new GameObject("RescuedFalafelVisual");
        root.transform.SetParent(parent, false);
        root.transform.localPosition = Vector3.zero;

        CreateBody(root.transform, RescuedBody, GoldCrust, radius);
        CreateEyes(root.transform, radius, EyeStyle.Happy);
        CreateSmile(root.transform, radius);
        CreateBlush(root.transform, radius);
        CreateLegs(root.transform, radius, LegBrown);

        return root;
    }

    /// <summary>Build a spicy-pepper enemy with angry face, teeth, and horns.</summary>
    public static GameObject BuildEnemyVisual(Transform parent, float radius = 0.45f)
    {
        GameObject root = new GameObject("EnemyVisual");
        root.transform.SetParent(parent, false);
        root.transform.localPosition = Vector3.zero;

        CreateBody(root.transform, EnemyRed, EnemyDark, radius);
        CreateEyes(root.transform, radius, EyeStyle.Angry);
        CreateAngryMouth(root.transform, radius);
        CreateHorns(root.transform, radius);

        return root;
    }

    // ── Eye Style ─────────────────────────────────────────────

    enum EyeStyle { Happy, Sad, Angry }

    // ── Body ──────────────────────────────────────────────────

    static void CreateBody(Transform parent, Color main, Color crust, float r)
    {
        // Main sphere
        GameObject body = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        body.name = "Body";
        body.transform.SetParent(parent, false);
        body.transform.localPosition = Vector3.up * r;
        body.transform.localScale = Vector3.one * r * 2f;
        ApplyMat(body, main, 0.25f, 0f);
        Kill(body.GetComponent<Collider>());

        // Crust bumps around the equator and crown
        for (int i = 0; i < 8; i++)
        {
            float angle = i * 45f * Mathf.Deg2Rad;
            float yOff = (i % 2 == 0) ? r * 0.55f : r * 0.75f;
            Vector3 pos = new Vector3(
                Mathf.Cos(angle) * r * 0.72f,
                r + yOff,
                Mathf.Sin(angle) * r * 0.72f
            );
            MakeBump(parent, pos, r * 0.14f, crust);
        }
    }

    static void MakeBump(Transform parent, Vector3 pos, float size, Color c)
    {
        GameObject b = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        b.name = "Bump";
        b.transform.SetParent(parent, false);
        b.transform.localPosition = pos;
        b.transform.localScale = Vector3.one * size;
        ApplyMat(b, c, 0.15f, 0f);
        Kill(b.GetComponent<Collider>());
    }

    // ── Eyes ──────────────────────────────────────────────────

    static void CreateEyes(Transform parent, float r, EyeStyle style)
    {
        float eyeY = r + r * 0.18f;
        float eyeZ = r * 0.84f;
        float spacing = r * 0.30f;
        float eyeR = r * 0.20f;

        for (int side = -1; side <= 1; side += 2)
        {
            Vector3 p = new Vector3(side * spacing, eyeY, eyeZ);

            // White sclera
            float yScale = style == EyeStyle.Sad ? 0.65f : style == EyeStyle.Angry ? 0.60f : 1.1f;
            GameObject eye = Prim(PrimitiveType.Sphere, parent, p,
                new Vector3(eyeR, eyeR * yScale, eyeR * 0.55f), "Eye");
            ApplyMat(eye, EyeWhite, 0.88f, 0f);

            // Pupil
            float pupilR = eyeR * 0.50f;
            Vector3 pp = p + Vector3.forward * eyeR * 0.22f + Vector3.down * eyeR * 0.06f;
            Color pupilColor = style == EyeStyle.Angry ? new Color(0.55f, 0.04f, 0f) : Pupil;
            GameObject pupil = Prim(PrimitiveType.Sphere, parent, pp,
                Vector3.one * pupilR, "Pupil");
            ApplyMat(pupil, pupilColor, 0.9f, 0f);

            // Specular highlight
            Vector3 hp = pp + new Vector3(pupilR * 0.3f, pupilR * 0.3f, pupilR * 0.35f);
            GameObject hl = Prim(PrimitiveType.Sphere, parent, hp,
                Vector3.one * pupilR * 0.32f, "HL");
            ApplyMat(hl, Highlight, 1f, 0f);

            // Eyebrows for sad/angry
            if (style == EyeStyle.Sad)
            {
                Vector3 bp = p + Vector3.up * eyeR * 1.05f;
                GameObject brow = Prim(PrimitiveType.Cube, parent, bp,
                    new Vector3(eyeR * 1.1f, eyeR * 0.10f, eyeR * 0.25f), "Brow");
                brow.transform.localRotation = Quaternion.Euler(0, 0, side * 18f);
                ApplyMat(brow, MouthDark, 0.3f, 0f);
            }
            else if (style == EyeStyle.Angry)
            {
                Vector3 bp = p + Vector3.up * eyeR * 1.1f + Vector3.forward * eyeR * 0.1f;
                GameObject brow = Prim(PrimitiveType.Cube, parent, bp,
                    new Vector3(eyeR * 1.3f, eyeR * 0.14f, eyeR * 0.28f), "Brow");
                brow.transform.localRotation = Quaternion.Euler(0, 0, -side * 28f);
                ApplyMat(brow, EnemyDark, 0.2f, 0f);
            }
        }
    }

    // ── Mouth ─────────────────────────────────────────────────

    static void CreateSmile(Transform parent, float r)
    {
        ArcMouth(parent, r, r - r * 0.15f, true, 8);
    }

    static void CreateFrown(Transform parent, float r)
    {
        ArcMouth(parent, r, r - r * 0.22f, false, 7);
    }

    static void ArcMouth(Transform parent, float r, float mouthY, bool smile, int segs)
    {
        float mouthZ = r * 0.86f;
        float arcW = r * 0.30f;
        float arcH = r * 0.10f;

        for (int i = 0; i < segs; i++)
        {
            float t = (float)i / (segs - 1) * Mathf.PI;
            float x = Mathf.Cos(t) * arcW;
            float y = smile ? (mouthY - Mathf.Sin(t) * arcH) : (mouthY + Mathf.Sin(t) * arcH);

            GameObject d = Prim(PrimitiveType.Sphere, parent,
                new Vector3(x, y, mouthZ), Vector3.one * r * 0.052f, "Mouth");
            ApplyMat(d, MouthDark, 0.3f, 0f);
        }
    }

    static void CreateAngryMouth(Transform parent, float r)
    {
        float mouthY = r - r * 0.18f;
        float mouthZ = r * 0.84f;

        // Mouth opening
        GameObject mBase = Prim(PrimitiveType.Cube, parent,
            new Vector3(0, mouthY, mouthZ),
            new Vector3(r * 0.42f, r * 0.10f, r * 0.08f), "MouthBase");
        ApplyMat(mBase, new Color(0.12f, 0.01f, 0.01f), 0.2f, 0f);

        // Teeth
        int count = 5;
        for (int i = 0; i < count; i++)
        {
            float x = (i - (count - 1) * 0.5f) * r * 0.08f;
            GameObject tooth = Prim(PrimitiveType.Cube, parent,
                new Vector3(x, mouthY + r * 0.055f, mouthZ + r * 0.015f),
                new Vector3(r * 0.05f, r * 0.07f, r * 0.04f), "Tooth");
            ApplyMat(tooth, new Color(0.96f, 0.93f, 0.86f), 0.6f, 0f);
        }
    }

    // ── Blush ─────────────────────────────────────────────────

    static void CreateBlush(Transform parent, float r)
    {
        float y = r - r * 0.02f;
        float z = r * 0.74f;
        float spacing = r * 0.40f;

        for (int s = -1; s <= 1; s += 2)
        {
            GameObject blush = Prim(PrimitiveType.Sphere, parent,
                new Vector3(s * spacing, y, z),
                new Vector3(r * 0.16f, r * 0.07f, r * 0.04f), "Blush");
            ApplyTransparent(blush, BlushPink);
        }
    }

    // ── Tears ─────────────────────────────────────────────────

    static void CreateTearStreaks(Transform parent, float r)
    {
        float eyeY = r + r * 0.18f;
        float tearZ = r * 0.80f;
        float spacing = r * 0.30f;

        for (int s = -1; s <= 1; s += 2)
        {
            for (int i = 0; i < 5; i++)
            {
                float y = eyeY - r * 0.12f - i * r * 0.10f;
                float sz = r * 0.038f * (1f - i * 0.12f);

                GameObject tear = Prim(PrimitiveType.Sphere, parent,
                    new Vector3(s * spacing, y, tearZ),
                    new Vector3(sz, sz * 1.6f, sz * 0.45f), "Tear");
                ApplyTransparent(tear, TearBlue);
            }
        }
    }

    // ── Legs ──────────────────────────────────────────────────

    static void CreateLegs(Transform parent, float r, Color c)
    {
        float spacing = r * 0.30f;

        for (int s = -1; s <= 1; s += 2)
        {
            GameObject leg = Prim(PrimitiveType.Capsule, parent,
                new Vector3(s * spacing, r * 0.05f, 0),
                new Vector3(r * 0.22f, r * 0.18f, r * 0.22f), "Leg");
            ApplyMat(leg, c, 0.25f, 0f);
        }
    }

    // ── Horns ─────────────────────────────────────────────────

    static void CreateHorns(Transform parent, float r)
    {
        float y = r + r * 0.82f;
        float spacing = r * 0.30f;

        for (int s = -1; s <= 1; s += 2)
        {
            GameObject horn = Prim(PrimitiveType.Capsule, parent,
                new Vector3(s * spacing, y, 0),
                new Vector3(r * 0.12f, r * 0.22f, r * 0.12f), "Horn");
            horn.transform.localRotation = Quaternion.Euler(0, 0, -s * 22f);
            ApplyMat(horn, HornYellow, 0.45f, 0.1f);
        }
    }

    // ── Helpers ───────────────────────────────────────────────

    static GameObject Prim(PrimitiveType type, Transform parent, Vector3 pos, Vector3 scale, string name)
    {
        GameObject g = GameObject.CreatePrimitive(type);
        g.name = name;
        g.transform.SetParent(parent, false);
        g.transform.localPosition = pos;
        g.transform.localScale = scale;
        Kill(g.GetComponent<Collider>());
        return g;
    }

    static void ApplyMat(GameObject g, Color c, float gloss, float metal)
    {
        Renderer r = g.GetComponent<Renderer>();
        if (r == null) return;
        Material m = new Material(Shader.Find("Standard"));
        m.color = c;
        m.SetFloat("_Glossiness", gloss);
        m.SetFloat("_Metallic", metal);
        r.material = m;
    }

    static void ApplyTransparent(GameObject g, Color c)
    {
        Renderer r = g.GetComponent<Renderer>();
        if (r == null) return;
        Material m = new Material(Shader.Find("Standard"));
        m.SetFloat("_Mode", 3f);
        m.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
        m.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
        m.SetInt("_ZWrite", 0);
        m.DisableKeyword("_ALPHATEST_ON");
        m.EnableKeyword("_ALPHABLEND_ON");
        m.DisableKeyword("_ALPHAPREMULTIPLY_ON");
        m.renderQueue = 3000;
        m.color = c;
        m.SetFloat("_Glossiness", 0.9f);
        r.material = m;
    }

    static void Kill(Object obj)
    {
        if (obj != null) Object.Destroy(obj);
    }
}
