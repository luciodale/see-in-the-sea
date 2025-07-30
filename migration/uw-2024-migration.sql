-- Migration SQL for UW 2024 submissions

INSERT INTO submissions (
      id, contest_id, category_id, user_email, title, description, 
      r2_key, image_url, original_filename, file_size, content_type
    ) VALUES (
      'WX4JCXXqDQ8LpPUFmJpqY', 'uw-2024', 'wide-angle', 'stefano.cerb@libero.it', 
      'Sea Dragon', '', 
      'uw-2024/wide-angle/stefano.cerb@libero.it/WX4JCXXqDQ8LpPUFmJpqY.jpg', 'uw-2024/wide-angle/stefano.cerb@libero.it/WX4JCXXqDQ8LpPUFmJpqY', 'sea-dragon.jpg', 
      1698071, 'image/jpeg'
    );