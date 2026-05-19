#!/usr/local/bin/python3.9
# save this as convert_api.py

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import subprocess
import os
import uuid
import time
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Allow requests from your frontend

# temp directory for uploads and conversions
UPLOAD_FOLDER = '/tmp/convert_uploads'
Path(UPLOAD_FOLDER).mkdir(exist_ok=True)

# cleanup old files (older than 1 hour)
def cleanup_old_files():
    now = time.time()
    for file in Path(UPLOAD_FOLDER).iterdir():
        if now - file.stat().st_mtime > 3600:  # 1 hour
            file.unlink()

@app.route('/api/convert', methods=['POST'])
def convert_file():
    cleanup_old_files()
    
    if 'file' not in request.files:
        return jsonify({'error': 'no file provided'}), 400
    
    file = request.files['file']
    output_format = request.form.get('format')
    
    if not file or not output_format:
        return jsonify({'error': 'missing file or format'}), 400
    
    # generate unique filenames
    file_id = str(uuid.uuid4())
    input_ext = os.path.splitext(file.filename)[1]
    input_path = os.path.join(UPLOAD_FOLDER, f'{file_id}_input{input_ext}')
    
    # determine output extension
    if output_format.startswith('extract-'):
        output_ext = '.' + output_format.split('-')[1]
    else:
        output_ext = '.' + output_format
    
    output_path = os.path.join(UPLOAD_FOLDER, f'{file_id}_output{output_ext}')
    
    try:
        # save uploaded file
        file.save(input_path)
        
        # build ffmpeg command based on format
        if output_format.startswith('extract-'):
            # extract audio from video
            cmd = [
                'ffmpeg', '-i', input_path,
                '-vn',  # no video
                '-acodec', 'libmp3' if 'mp3' in output_format else 'libvorbis',
                '-y',  # overwrite output
                output_path
            ]
        elif output_format in ['mp3', 'ogg', 'wav', 'flac', 'm4a']:
            # audio conversion
            cmd = ['ffmpeg', '-i', input_path, '-y', output_path]
        elif output_format in ['mp4', 'webm', 'avi', 'mkv', 'mov']:
            # video conversion
            cmd = [
                'ffmpeg', '-i', input_path,
                '-c:v', 'libx264' if output_format == 'mp4' else 'copy',
                '-c:a', 'aac' if output_format == 'mp4' else 'copy',
                '-y',
                output_path
            ]
        else:
            return jsonify({'error': 'unsupported format'}), 400
        
        # run ffmpeg
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=300  # 5 minute timeout
        )
        
        if result.returncode != 0:
            error_msg = result.stderr.decode('utf-8')
            return jsonify({'error': f'conversion failed: {error_msg}'}), 500
        
        # send converted file
        response = send_file(
            output_path,
            as_attachment=True,
            download_name=f'converted{output_ext}'
        )
        
        # cleanup after sending (in a real app, use a background task)
        @response.call_on_close
        def cleanup():
            try:
                os.remove(input_path)
                os.remove(output_path)
            except:
                pass
        
        return response
        
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'conversion timeout'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
