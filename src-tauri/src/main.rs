#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use tauri::{AppHandle, Manager};

fn model_preference_path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    let directory = app.path().app_config_dir().map_err(|error| error.to_string())?;
    fs::create_dir_all(&directory).map_err(|error| error.to_string())?;
    Ok(directory.join("selected_ollama_model.txt"))
}

#[tauri::command]
fn get_selected_ollama_model(app: AppHandle) -> Result<Option<String>, String> {
    let path = model_preference_path(&app)?;
    match fs::read_to_string(path) {
        Ok(model) => {
            let model = model.trim().to_owned();
            Ok((!model.is_empty()).then_some(model))
        }
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(error.to_string()),
    }
}

#[tauri::command]
fn set_selected_ollama_model(app: AppHandle, model: String) -> Result<(), String> {
    let model = model.trim();
    if model.is_empty() || model.len() > 512 || model.contains(['\0', '\n', '\r']) {
        return Err("Invalid Ollama model name".to_owned());
    }
    fs::write(model_preference_path(&app)?, model).map_err(|error| error.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_selected_ollama_model,
            set_selected_ollama_model
        ])
        .run(tauri::generate_context!())
        .expect("error while running Cyber Workbench");
}
