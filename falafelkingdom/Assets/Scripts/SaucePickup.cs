using UnityEngine;

public class SaucePickup : MonoBehaviour
{
    public int amount = 1;
    public GameObject collectEffect;

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            SauceManager.Instance.Collect(amount);
            if (collectEffect != null)
                Instantiate(collectEffect, transform.position, Quaternion.identity);
            Destroy(gameObject);
        }
    }
}
