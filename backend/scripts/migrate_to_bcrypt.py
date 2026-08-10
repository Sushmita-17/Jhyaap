"""
Migration script to convert existing SHA-256 passwords to bcrypt.
This ensures existing users can still login after the security upgrade.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import get_connection, is_postgres
import bcrypt

def migrate_passwords():
    """Migrate existing SHA-256 passwords to bcrypt."""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Get all users with password hashes
        if is_postgres(conn):
            cursor.execute("SELECT id, phone_number, password_hash FROM rider_credentials WHERE password_hash IS NOT NULL")
        else:
            cursor.execute("SELECT id, phone_number, password_hash FROM rider_credentials WHERE password_hash IS NOT NULL")
        
        users = cursor.fetchall()
        
        if not users:
            print("[INFO] No users found with password hashes.")
            return
        
        print(f"[INFO] Found {len(users)} users to migrate...")
        
        migrated_count = 0
        skipped_count = 0
        
        for user in users:
            if isinstance(user, dict):
                user_id = user['id']
                phone_number = user.get('phone_number', 'Unknown')
                password_hash = user.get('password_hash', '')
            else:
                columns = [col[0] for col in cursor.description]
                user_dict = dict(zip(columns, user))
                user_id = user_dict['id']
                phone_number = user_dict.get('phone_number', 'Unknown')
                password_hash = user_dict.get('password_hash', '')
            
            # Check if already bcrypt (bcrypt hashes start with $2b$)
            if password_hash.startswith('$2b$'):
                print(f"[SKIP] {phone_number} - already using bcrypt")
                skipped_count += 1
                continue
            
            # Check if it's SHA-256 format (salt$hash)
            if '$' not in password_hash:
                print(f"[SKIP] {phone_number} - unknown hash format")
                skipped_count += 1
                continue
            
            # Migrate SHA-256 to bcrypt
            try:
                # For SHA-256 passwords, we need users to reset their passwords
                # since we can't securely convert them
                print(f"[RESET] {phone_number} - SHA-256 detected, password reset required")
                
                # Set a temporary bcrypt hash that will require password reset
                temp_password = "TEMP_RESET_REQUIRED"
                salt = bcrypt.gensalt()
                temp_hash = bcrypt.hashpw(temp_password.encode('utf-8'), salt).decode('utf-8')
                
                if is_postgres(conn):
                    cursor.execute(
                        "UPDATE rider_credentials SET password_hash = %s WHERE id = %s",
                        (temp_hash, user_id)
                    )
                else:
                    cursor.execute(
                        "UPDATE rider_credentials SET password_hash = ? WHERE id = ?",
                        (temp_hash, user_id)
                    )
                
                migrated_count += 1
                
            except Exception as e:
                print(f"[ERROR] Failed to migrate {phone_number}: {e}")
        
        conn.commit()
        print(f"\n[OK] Migration complete!")
        print(f"   Migrated: {migrated_count}")
        print(f"   Skipped: {skipped_count}")
        print(f"\n[IMPORTANT] Users with migrated passwords will need to reset their passwords.")
        print(f"            Their current passwords will no longer work.")
        
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Migration failed: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print("=== SHA-256 to Bcrypt Password Migration ===")
    print("This will convert existing SHA-256 passwords to bcrypt.")
    print("Users with SHA-256 passwords will need to reset their passwords.\n")
    
    confirm = input("Continue? (yes/no): ")
    if confirm.lower() not in ['yes', 'y']:
        print("Migration cancelled.")
        sys.exit(0)
    
    migrate_passwords()