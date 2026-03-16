using UnityEngine;

/// <summary>
/// Safety spawner: ensures at least one FalafelNPC exists in the level.
/// Attach to any persistent GameObject (e.g. GameManager) in each scene
/// and assign a FalafelNPC prefab. If a FalafelNPC is already present at
/// Start the spawner does nothing.
/// </summary>
public class FalafelAutoSpawner : MonoBehaviour
{
    [Tooltip("Prefab with a FalafelNPC component to instantiate if no NPC is found.")]
    public GameObject falafelNpcPrefab;

    [Tooltip("World-space position where the NPC will spawn.")]
    public Vector3 spawnPosition = new Vector3(0f, 1f, 0f);

    void Start()
    {
        if (FindObjectOfType<FalafelNPC>() != null) return;
        if (falafelNpcPrefab == null)
        {
            // No prefab assigned — build a minimal NPC from scratch
            GameObject npcObj = new GameObject("FalafelNPC_AutoSpawned");
            npcObj.transform.position = spawnPosition;
            npcObj.AddComponent<SphereCollider>().radius = 0.5f;
            npcObj.AddComponent<FalafelNPC>();
            return;
        }
        Instantiate(falafelNpcPrefab, spawnPosition, Quaternion.identity);
    }
}
