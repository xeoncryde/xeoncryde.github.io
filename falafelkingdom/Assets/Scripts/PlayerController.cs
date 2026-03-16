using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    CharacterController controller;
    public float speed = 6.0f;
    public float jumpSpeed = 8.0f;
    public float gravity = -20.0f;

    [Header("Jump Assist")]
    [Tooltip("Allows jumping this many seconds after leaving ground (edge forgiveness).")]
    public float coyoteTime = 0.15f;
    [Tooltip("Honors a jump button press this many seconds before landing.")]
    public float jumpBufferTime = 0.15f;

    private float lastGroundedTime = -999f;
    private float lastJumpPressedTime = -999f;
    private Vector3 moveDirection = Vector3.zero;

    public Transform cam;
    public float turnSmoothTime = 0.1f;
    float turnSmoothVelocity;
    private Vector3 initialPosition;
    private Quaternion initialRotation;

    public PauseMenu pauseMenu;

    public Animator animator;
    public bool isFalling = false;

    void Start()
    {
        controller = GetComponent<CharacterController>();
        initialPosition = transform.position;
        initialRotation = transform.rotation;
        initialPosition.y += 50;
        pauseMenu = GetComponent<PauseMenu>();
        Transform tyModel = transform.Find("ty");
        if (tyModel != null)
            animator = tyModel.GetComponent<Animator>();

        if (GetComponent<FalafelPlayerVisual>() == null)
            gameObject.AddComponent<FalafelPlayerVisual>();
    }

    void Update()
    {
        if (pauseMenu != null && pauseMenu.paused)
            return;

        float xDisplacement = Input.GetAxisRaw("Horizontal");
        float zDisplacement = Input.GetAxisRaw("Vertical");
        bool grounded = controller.isGrounded;

        // Track last grounded time for coyote time
        if (grounded) lastGroundedTime = Time.time;

        // Track last jump press time for jump buffering
        if (Input.GetKeyDown(KeyCode.Space)) lastJumpPressedTime = Time.time;

        if (animator != null)
        {
            animator.SetBool("isGrounded", grounded);
            if (grounded) animator.SetBool("isFalling", false);
        }

        if (isFalling)
            xDisplacement = zDisplacement = 0.0f;

        // Ground stick — keeps character firmly on ground, prevents floating
        if (grounded && moveDirection.y < 0f)
            moveDirection.y = -2f;

        // Jump: fire if both coyote window and buffer window are active
        bool canJump = (Time.time - lastGroundedTime) <= coyoteTime;
        bool wantJump = (Time.time - lastJumpPressedTime) <= jumpBufferTime;

        if (wantJump && canJump)
        {
            moveDirection.y = jumpSpeed;
            lastJumpPressedTime = -999f;
            lastGroundedTime = -999f;
            if (animator != null)
            {
                animator.SetTrigger("isJumping");
                animator.SetBool("isRunning", false);
                animator.SetBool("isIdling", false);
            }
        }

        // Horizontal movement (camera-relative)
        if (xDisplacement != 0f || zDisplacement != 0f)
        {
            float targetAngle = Mathf.Atan2(xDisplacement, zDisplacement) * Mathf.Rad2Deg + cam.eulerAngles.y;
            float angle = Mathf.SmoothDampAngle(transform.eulerAngles.y, targetAngle, ref turnSmoothVelocity, turnSmoothTime);
            transform.rotation = Quaternion.Euler(0f, angle, 0f);
            Vector3 moveDir = Quaternion.Euler(0f, targetAngle, 0f) * Vector3.forward;
            moveDir *= speed;
            moveDir.y = moveDirection.y;
            controller.Move(moveDir * Time.deltaTime);
            if (animator != null)
            {
                animator.SetBool("isRunning", grounded);
                animator.SetBool("isIdling", false);
            }
        }
        else
        {
            controller.Move(new Vector3(0, moveDirection.y, 0) * Time.deltaTime);
            if (animator != null)
            {
                animator.SetBool("isRunning", false);
                animator.SetBool("isIdling", grounded);
            }
        }

        // Apply gravity
        moveDirection.y += gravity * Time.deltaTime;

        // NPC interaction
        if (Input.GetKeyDown(KeyCode.E))
        {
            Collider[] nearby = Physics.OverlapSphere(transform.position, 3f);
            foreach (var col in nearby)
            {
                FalafelNPC npc = col.GetComponent<FalafelNPC>();
                if (npc != null) { npc.TryRescue(); break; }
            }
        }

        // Respawn if fallen off the map
        if (transform.position.y < -30)
        {
            transform.position = initialPosition;
            transform.rotation = initialRotation;
            moveDirection = Vector3.zero;
            if (animator != null) animator.SetBool("isFalling", true);
        }
    }
}
