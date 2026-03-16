using UnityEngine;

public class BullyEnemy : MonoBehaviour
{
    public float patrolDistance = 4f;
    public float speed = 2.5f;
    public int sauceStolenOnTouch = 1;

    private Vector3 startPos;
    private int direction = 1;

    void Start()
    {
        startPos = transform.position;
    }

    void Update()
    {
        transform.position += Vector3.right * direction * speed * Time.deltaTime;

        float offset = transform.position.x - startPos.x;
        if (offset > patrolDistance || offset < -patrolDistance)
            direction *= -1;
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            SauceManager.Instance.TrySpend(sauceStolenOnTouch);
            CharacterController cc = other.GetComponent<CharacterController>();
            if (cc != null)
            {
                Vector3 pushDir = (other.transform.position - transform.position).normalized;
                cc.Move(pushDir * 5f);
            }
        }
    }
}
