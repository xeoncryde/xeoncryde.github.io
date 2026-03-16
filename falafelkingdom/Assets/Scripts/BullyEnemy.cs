using System.Collections;
using UnityEngine;

public class BullyEnemy : MonoBehaviour
{
    public enum EnemyType { Patrol, Chaser }

    [Header("Type")]
    public EnemyType enemyType = EnemyType.Patrol;

    [Header("Patrol")]
    public Vector3 patrolAxis = Vector3.right;
    public float patrolDistance = 5f;
    public float patrolSpeed = 2f;

    [Header("Chase")]
    public float chaseRange = 6f;
    public float chaseSpeed = 4f;
    public float loseRange = 10f;

    [Header("Knockback")]
    public float knockbackForce = 8f;
    public int sauceSteal = 2;

    private Vector3 patrolOrigin;
    private bool patrolForward = true;
    private bool isChasing = false;
    private Transform player;
    private Vector3 patrolReturnTarget;
    private bool returningToPatrol = false;

    private bool canHitPlayer = true;
    private float hitCooldown = 1.5f;

    void Start()
    {
        patrolOrigin = transform.position;
        player = GameObject.FindGameObjectWithTag("Player")?.transform;

        SetupVisual();
    }

    void SetupVisual()
    {
        // Hide any existing renderers
        foreach (Renderer r in GetComponentsInChildren<Renderer>())
            r.enabled = false;

        // Build procedural enemy visual
        FalafelCharacterBuilder.BuildEnemyVisual(transform, 0.45f);
    }

    void Update()
    {
        if (player == null) return;

        float distToPlayer = Vector3.Distance(transform.position, player.position);

        if (enemyType == EnemyType.Chaser)
        {
            if (distToPlayer <= chaseRange)
            {
                isChasing = true;
                returningToPatrol = false;
            }
            else if (isChasing && distToPlayer > loseRange)
            {
                isChasing = false;
                returningToPatrol = true;
                patrolReturnTarget = patrolOrigin;
            }
        }
        else
        {
            if (distToPlayer <= chaseRange)
                isChasing = true;
            else if (isChasing && distToPlayer > loseRange)
            {
                isChasing = false;
                returningToPatrol = true;
                patrolReturnTarget = patrolOrigin;
            }
        }

        if (isChasing)
        {
            ChasePlayer();
        }
        else if (returningToPatrol)
        {
            ReturnToPatrol();
        }
        else
        {
            Patrol();
        }

        // Spin for visual interest
        transform.Rotate(Vector3.up, 90f * Time.deltaTime, Space.World);
    }

    void Patrol()
    {
        Vector3 dir = patrolAxis.normalized;
        Vector3 target = patrolForward
            ? patrolOrigin + dir * patrolDistance
            : patrolOrigin - dir * patrolDistance;

        transform.position = Vector3.MoveTowards(transform.position, target, patrolSpeed * Time.deltaTime);

        if (Vector3.Distance(transform.position, target) < 0.05f)
            patrolForward = !patrolForward;
    }

    void ChasePlayer()
    {
        transform.position = Vector3.MoveTowards(transform.position, player.position, chaseSpeed * Time.deltaTime);
    }

    void ReturnToPatrol()
    {
        transform.position = Vector3.MoveTowards(transform.position, patrolReturnTarget, patrolSpeed * Time.deltaTime);
        if (Vector3.Distance(transform.position, patrolReturnTarget) < 0.05f)
            returningToPatrol = false;
    }

    void OnTriggerEnter(Collider other)
    {
        if (!canHitPlayer) return;
        if (!other.CompareTag("Player")) return;

        if (SauceManager.Instance != null)
            SauceManager.Instance.Collect(-sauceSteal);

        // Knockback
        CharacterController cc = other.GetComponent<CharacterController>();
        if (cc != null)
        {
            Vector3 knockDir = (other.transform.position - transform.position).normalized;
            knockDir.y = 0.5f;
            StartCoroutine(ApplyKnockback(cc, knockDir * knockbackForce));
        }

        canHitPlayer = false;
        StartCoroutine(ResetHitCooldown());
    }

    IEnumerator ApplyKnockback(CharacterController cc, Vector3 force)
    {
        float t = 0f;
        float duration = 0.3f;
        while (t < duration)
        {
            float decay = 1f - (t / duration);
            cc.Move(force * decay * Time.deltaTime);
            t += Time.deltaTime;
            yield return null;
        }
    }

    IEnumerator ResetHitCooldown()
    {
        yield return new WaitForSeconds(hitCooldown);
        canHitPlayer = true;
    }

    void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, chaseRange);
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, loseRange);
        if (Application.isPlaying) return;
        Vector3 dir = patrolAxis.normalized;
        Gizmos.color = Color.blue;
        Gizmos.DrawLine(transform.position - dir * patrolDistance, transform.position + dir * patrolDistance);
    }
}
