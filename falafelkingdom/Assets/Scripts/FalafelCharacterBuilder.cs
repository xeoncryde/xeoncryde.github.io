using UnityEngine;

public class FalafelCharacterBuilder : MonoBehaviour
{
    void Awake()
    {
        Transform ty = transform.Find("ty");
        if (ty == null)
            return;

        // Remove existing renderers on the "ty" child
        foreach (MeshRenderer mr in ty.GetComponentsInChildren<MeshRenderer>())
            Destroy(mr);
        foreach (SkinnedMeshRenderer smr in ty.GetComponentsInChildren<SkinnedMeshRenderer>())
            Destroy(smr);

        // Body — warm falafel brown sphere
        GameObject body = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        body.transform.SetParent(ty, false);
        body.transform.localScale = new Vector3(1f, 1f, 1f);
        body.transform.localPosition = Vector3.zero;
        SetMaterialColor(body, new Color(0.72f, 0.47f, 0.25f));
        RemoveCollider(body);

        // Left eye
        GameObject leftEye = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        leftEye.transform.SetParent(ty, false);
        leftEye.transform.localScale = new Vector3(0.18f, 0.18f, 0.1f);
        leftEye.transform.localPosition = new Vector3(0.22f, 0.18f, 0.48f);
        SetMaterialColor(leftEye, Color.black);
        RemoveCollider(leftEye);

        // Right eye
        GameObject rightEye = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        rightEye.transform.SetParent(ty, false);
        rightEye.transform.localScale = new Vector3(0.18f, 0.18f, 0.1f);
        rightEye.transform.localPosition = new Vector3(-0.22f, 0.18f, 0.48f);
        SetMaterialColor(rightEye, Color.black);
        RemoveCollider(rightEye);

        // Left blush
        GameObject leftBlush = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        leftBlush.transform.SetParent(ty, false);
        leftBlush.transform.localScale = new Vector3(0.22f, 0.12f, 0.05f);
        leftBlush.transform.localPosition = new Vector3(0.32f, 0.0f, 0.46f);
        SetMaterialColor(leftBlush, new Color(0.95f, 0.6f, 0.6f, 0.75f));
        RemoveCollider(leftBlush);

        // Right blush
        GameObject rightBlush = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        rightBlush.transform.SetParent(ty, false);
        rightBlush.transform.localScale = new Vector3(0.22f, 0.12f, 0.05f);
        rightBlush.transform.localPosition = new Vector3(-0.32f, 0.0f, 0.46f);
        SetMaterialColor(rightBlush, new Color(0.95f, 0.6f, 0.6f, 0.75f));
        RemoveCollider(rightBlush);
    }

    private void SetMaterialColor(GameObject obj, Color color)
    {
        MeshRenderer mr = obj.GetComponent<MeshRenderer>();
        if (mr == null)
            return;
        Material mat = new Material(Shader.Find("Standard"));
        mat.color = color;
        if (color.a < 1f)
        {
            mat.SetFloat("_Mode", 3);
            mat.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
            mat.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
            mat.SetInt("_ZWrite", 0);
            mat.DisableKeyword("_ALPHATEST_ON");
            mat.EnableKeyword("_ALPHABLEND_ON");
            mat.DisableKeyword("_ALPHAPREMULTIPLY_ON");
            mat.renderQueue = 3000;
        }
        mr.material = mat;
    }

    private void RemoveCollider(GameObject obj)
    {
        Collider col = obj.GetComponent<Collider>();
        if (col != null)
            Destroy(col);
    }
}
