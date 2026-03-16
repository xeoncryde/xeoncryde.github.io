#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

namespace FalafelKingdom.Editor
{
    public static class FalafelMaterialSetup
    {
        [MenuItem("Tools/Falafel Kingdom/Setup Falafel Materials")]
        public static void SetupMaterials()
        {
            CreateMaterial("FalafelPlayer",     new Color(0.82f, 0.60f, 0.22f), 0.25f, 0.0f);
            CreateMaterial("FalafelNPC_Crying",  new Color(0.75f, 0.65f, 0.42f), 0.15f, 0.0f);
            CreateMaterial("FalafelNPC_Rescued", new Color(0.90f, 0.70f, 0.28f), 0.40f, 0.0f);
            CreateMaterial("BullyEnemy",         new Color(0.72f, 0.10f, 0.06f), 0.20f, 0.0f);
            CreateMaterial("SauceCollectible",   new Color(0.95f, 0.30f, 0.05f), 0.9f,  0.2f);

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[FalafelKingdom] Falafel materials created in Assets/Materials/");
        }

        static void CreateMaterial(string matName, Color color, float glossiness, float metallic)
        {
            string path = "Assets/Materials/" + matName + ".mat";
            Material existing = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (existing != null)
            {
                existing.color = color;
                existing.SetFloat("_Glossiness", glossiness);
                existing.SetFloat("_Metallic", metallic);
                EditorUtility.SetDirty(existing);
                return;
            }

            Material mat = new Material(Shader.Find("Standard"));
            mat.color = color;
            mat.SetFloat("_Glossiness", glossiness);
            mat.SetFloat("_Metallic", metallic);
            AssetDatabase.CreateAsset(mat, path);
        }
    }
}
#endif
