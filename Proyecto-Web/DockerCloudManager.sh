#!/bin/bash

# ============================================================
# Docker Project Manager - Gestor interactivo Docker Compose
# ============================================================

set -u

# ============================================================
# VARIABLES
# ============================================================

readonly SCRIPT_DIR
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly APP_NAME="Docker Project Manager"

# Colores
readonly C_RESET="\033[0m"
readonly C_BOLD="\033[1m"
readonly C_RED="\033[31m"
readonly C_GREEN="\033[32m"
readonly C_YELLOW="\033[33m"
readonly C_BLUE="\033[34m"
readonly C_CYAN="\033[36m"

COMPOSE_FILE="${COMPOSE_FILE:-$SCRIPT_DIR/docker-compose.yml}"
DOCKER_CMD=""

# ============================================================
# FUNCIONES UTILITARIAS
# ============================================================

# Limpiar pantalla
clear_screen() { clear || true; }

# Pausa
pause() { echo; read -r -p "Pulsa ENTER para continuar..."; }

# Mostrar error
error() { printf "%b[ERROR]%b %s\n" "$C_RED" "$C_RESET" "$*" >&2; }

# Mostrar advertencia
warn() { printf "%b[AVISO]%b %s\n" "$C_YELLOW" "$C_RESET" "$*"; }

# Mostrar info
info() { printf "%b[INFO]%b %s\n" "$C_CYAN" "$C_RESET" "$*"; }

# Mostrar éxito
success() { printf "%b[OK]%b %s\n" "$C_GREEN" "$C_RESET" "$*"; }

# Confirmación Sí/No
confirm() {
    local prompt="$1"
    local response
    printf "%b%s%b " "$C_YELLOW" "$prompt [s/N]:" "$C_RESET"
    read -r response || return 1
    [[ "${response,,}" =~ ^(s|si|sí|y|yes)$ ]]
}

# Confirmación de seguridad
confirm_dangerous() {
    local text="$1"
    local response
    printf "%b%s%b " "$C_RED" "Escribe '$text' para confirmar:" "$C_RESET"
    read -r response || return 1
    [[ "$response" == "$text" ]]
}

# ============================================================
# FUNCIONES - DETECCIÓN
# ============================================================

# Detectar docker-compose
detect_docker() {
    if command -v docker-compose &>/dev/null; then
        DOCKER_CMD="docker-compose"
        return 0
    fi
    return 1
}

# Buscar archivo compose
find_compose_file() {
    local file
    for file in "$SCRIPT_DIR"/{compose,docker-compose}.{yml,yaml}; do
        if [[ -f "$file" ]]; then
            COMPOSE_FILE="$file"
            return 0
        fi
    done
    return 1
}

# Validar requisitos
require_all() {
    if ! detect_docker; then
        error "Docker no está disponible"
        return 1
    fi
    if ! find_compose_file; then
        error "No se encontró docker-compose.yml en: $SCRIPT_DIR"
        return 1
    fi
}

# ============================================================
# FUNCIONES - INFORMACIÓN
# ============================================================

# Encabezado
show_header() {
    clear_screen
    printf "%b%s%b\n" "$C_BOLD$C_BLUE" "============================================================" "$C_RESET"
    printf "%b%s%b\n" "$C_BOLD$C_BLUE" "        $APP_NAME" "$C_RESET"
    printf "%b%s%b\n" "$C_BOLD$C_BLUE" "============================================================" "$C_RESET"
    echo
    printf "%bRuta:%b %s\n" "$C_CYAN" "$C_RESET" "$SCRIPT_DIR"
    printf "%bCompose:%b %s\n" "$C_CYAN" "$C_RESET" "${COMPOSE_FILE:-NO DETECTADO}"
    printf "%bDocker CLI:%b %s\n" "$C_CYAN" "$C_RESET" "$DOCKER_CMD"
    echo
}

# Listar servicios
show_services() {
    if ! require_all; then
        pause
        return 1
    fi
    echo
    info "Servicios disponibles:"
    echo
    local compose_dir
    compose_dir="$(dirname "$COMPOSE_FILE")"
    (cd "$compose_dir" && $DOCKER_CMD config --services) || error "No se pudieron listar servicios"
    echo
}

# Mostrar contenedores
show_containers() {
    if ! require_all; then
        pause
        return 1
    fi
    echo
    info "Estado de contenedores:"
    echo
    local compose_dir
    compose_dir="$(dirname "$COMPOSE_FILE")"
    (cd "$compose_dir" && $DOCKER_CMD ps) || true
    echo
}

# ============================================================
# FUNCIONES - ENTRADA
# ============================================================

# Seleccionar servicios
select_services() {
    local prompt="${1:-Introduce servicios (vacío=todos):}"
    local services
    echo
    read -r -p "$prompt " services || return 1
    services="$(echo "$services" | xargs)"
    echo "$services"
}

# Ejecutar comando docker-compose
run_docker() {
    local -a args=("$@")
    local compose_dir
    compose_dir="$(dirname "$COMPOSE_FILE")"
    info "Ejecutando: $DOCKER_CMD ${args[*]}"
    echo
    (cd "$compose_dir" && $DOCKER_CMD "${args[@]}")
    local code=$?
    if [[ $code -eq 0 ]]; then
        echo
        success "Completado"
        return 0
    else
        error "Falló con código: $code"
        return $code
    fi
}

# ============================================================
# ACCIONES - UP (Arrancar)
# ============================================================

action_up_simple() {
    show_header
    if ! require_all; then
        pause
        return
    fi
    confirm "¿Arrancar todos los servicios? (docker-compose up -d)" && run_docker up -d
    pause
}

action_up_build() {
    show_header
    if ! require_all; then
        pause
        return
    fi
    confirm "¿Reconstruir y arrancar? (docker-compose up -d --build)" && run_docker up -d --build
    pause
}

action_up_partial() {
    show_header
    if ! require_all; then
        pause
        return
    fi
    show_services || return
    local services
    services="$(select_services "Servicios para arrancar:" || echo "")"
    if [[ -z "$services" ]]; then
        warn "No se especificaron servicios"
        pause
        return
    fi
    confirm "¿Arrancar estos servicios?" && run_docker up -d "$services"
    pause
}

action_up_partial_build() {
    show_header
    if ! require_all; then
        pause
        return
    fi
    show_services || return
    local services
    services="$(select_services "Servicios para reconstruir:" || echo "")"
    if [[ -z "$services" ]]; then
        warn "No se especificaron servicios"
        pause
        return
    fi
    confirm "¿Reconstruir y arrancar estos servicios?" && run_docker up -d --build "$services"
    pause
}

# ============================================================
# ACCIONES - DOWN (Detener)
# ============================================================

action_down() {
    show_header
    if ! require_all; then
        pause
        return
    fi
    confirm "¿Detener contenedores? (docker-compose down)" && run_docker down
    pause
}

action_down_volumes() {
    show_header
    warn "Esto eliminará volúmenes. Los datos pueden perderse."
    if ! require_all; then
        pause
        return
    fi
    confirm "¿Detener y eliminar volúmenes?" && run_docker down -v
    pause
}

action_stop() {
    show_header
    if ! require_all; then
        pause
        return
    fi
    confirm "¿Pausar todos los servicios? (docker-compose stop)" && run_docker stop
    pause
}

action_stop_partial() {
    show_header
    if ! require_all; then
        pause
        return
    fi
    show_services || return
    local services
    services="$(select_services "Servicios para pausar:" || echo "")"
    if [[ -z "$services" ]]; then
        warn "No se especificaron servicios"
        pause
        return
    fi
    confirm "¿Pausar estos servicios?" && run_docker stop "$services"
    pause
}

# ============================================================
# ACCIONES - CONNECT (Conectar)
# ============================================================

action_connect_service_bash() {
    show_header
    if ! require_all; then
        pause
        return
    fi
    show_services || return
    echo
    read -r -p "Servicio: " service
    service="$(echo "$service" | xargs)"
    [[ -z "$service" ]] && { error "Servicio vacío"; pause; return; }
    info "Conectando a $service con /bin/bash..."
    warn "Ctrl+D para salir"
    pause
    local compose_dir
    compose_dir="$(dirname "$COMPOSE_FILE")"
    (cd "$compose_dir" && $DOCKER_CMD exec "$service" /bin/bash) || warn "No se pudo conectar"
    pause
}

action_connect_service_sh() {
    show_header
    if ! require_all; then
        pause
        return
    fi
    show_services || return
    echo
    read -r -p "Servicio: " service
    service="$(echo "$service" | xargs)"
    [[ -z "$service" ]] && { error "Servicio vacío"; pause; return; }
    info "Conectando a $service con /bin/sh..."
    warn "Ctrl+D para salir"
    pause
    local compose_dir
    compose_dir="$(dirname "$COMPOSE_FILE")"
    (cd "$compose_dir" && $DOCKER_CMD exec "$service" /bin/sh) || warn "No se pudo conectar"
    pause
}

action_connect_container_bash() {
    show_header
    show_containers || return
    echo
    read -r -p "Contenedor: " container
    container="$(echo "$container" | xargs)"
    [[ -z "$container" ]] && { error "Contenedor vacío"; pause; return; }
    info "Conectando a $container con /bin/bash..."
    warn "Ctrl+D para salir"
    pause
    docker exec -it "$container" /bin/bash || warn "No se pudo conectar"
    pause
}

action_connect_container_sh() {
    show_header
    show_containers || return
    echo
    read -r -p "Contenedor: " container
    container="$(echo "$container" | xargs)"
    [[ -z "$container" ]] && { error "Contenedor vacío"; pause; return; }
    info "Conectando a $container con /bin/sh..."
    warn "Ctrl+D para salir"
    pause
    docker exec -it "$container" /bin/sh || warn "No se pudo conectar"
    pause
}

# ============================================================
# ACCIONES - LOGS
# ============================================================

action_logs_all() {
    show_header
    if ! require_all; then
        pause
        return
    fi
    warn "Ctrl+C para detener"
    pause
    run_docker logs -f || true
    pause
}

action_logs_partial() {
    show_header
    if ! require_all; then
        pause
        return
    fi
    show_services || return
    local services
    services="$(select_services "Servicios para logs:" || echo "")"
    if [[ -z "$services" ]]; then
        warn "No se especificaron servicios"
        pause
        return
    fi
    warn "Ctrl+C para detener"
    pause
    run_docker logs -f "$services" || true
    pause
}

# ============================================================
# ACCIONES - FACTORY RESET
# ============================================================

action_factory_reset() {
    show_header
    warn "Se borrará: mysql/02-insertar.sql"
    warn "Se borrarán todas las carpetas en: users/"
    echo
    if ! confirm "¿Continuar?"; then
        info "Cancelado"
        pause
        return
    fi
    if ! confirm_dangerous "FACTORY RESET"; then
        error "Confirmación incorrecta"
        pause
        return
    fi
    
    local sql="$SCRIPT_DIR/mysql/02-insertar.sql"
    local users="$SCRIPT_DIR/users"
    local deleted=0
    local failed=0
    
    echo
    
    if [[ -f "$sql" ]]; then
        # shellcheck disable=SC2015
        rm -f "$sql" && { success "Eliminado: $sql"; ((deleted++)); } || ((failed++))
    fi
    
    if [[ -d "$users" ]]; then
        shopt -s nullglob
        for dir in "$users"/*/; do
            # shellcheck disable=SC2015
            rm -rf "$dir" && { success "Eliminado: $dir"; ((deleted++)); } || ((failed++))
        done
        shopt -u nullglob
    fi
    
    echo
    success "Factory Reset: $deleted eliminados, $failed errores"
    pause
}

# ============================================================
# ACCIONES - RESTART
# ============================================================

action_restart_all() {
    show_header
    if ! require_all; then
        pause
        return
    fi

    confirm "¿Reiniciar todos los servicios? (docker-compose restart)" && run_docker restart
    pause
}

action_restart_partial() {
    show_header
    if ! require_all; then
        pause
        return
    fi

    show_services || return

    local services
    services="$(select_services "Servicios para reiniciar:" || echo "")"

    if [[ -z "$services" ]]; then
        warn "No se especificaron servicios"
        pause
        return
    fi

    confirm "¿Reiniciar estos servicios?" && run_docker restart $services
    pause
}

# ============================================================
# ACCIONES - CLEAN ALL
# ============================================================

action_clean_all() {
    show_header
    warn "Se ejecutará: docker-compose down -v + Factory Reset"
    if ! confirm "¿Continuar?"; then
        info "Cancelado"
        pause
        return
    fi
    
    echo
    if ! require_all; then
        pause
        return
    fi
    
    run_docker down -v || { error "down -v falló"; pause; return; }
    pause
    
    if ! confirm_dangerous "FACTORY RESET"; then
        error "Confirmación incorrecta"
        pause
        return
    fi
    
    local sql="$SCRIPT_DIR/mysql/02-insertar.sql"
    local users="$SCRIPT_DIR/users"
    local deleted=0
    local failed=0
    
    echo
    
    if [[ -f "$sql" ]]; then
        # shellcheck disable=SC2015
        rm -f "$sql" && { success "Eliminado: $sql"; ((deleted++)); } || ((failed++))
    fi
    
    if [[ -d "$users" ]]; then
        shopt -s nullglob
        for dir in "$users"/*/; do
            # shellcheck disable=SC2015
            rm -rf "$dir" && { success "Eliminado: $dir"; ((deleted++)); } || ((failed++))
        done
        shopt -u nullglob
    fi
    
    echo
    success "Limpieza completa: $deleted eliminados, $failed errores"
    pause
}

# ============================================================
# MENÚ - UP
# ============================================================

menu_up() {
    while true; do
        show_header
        cat <<EOF
═══════════════════════════════════════════════════════════
  ARRANCAR SERVICIOS
═══════════════════════════════════════════════════════════

  1) docker-compose up -d
  2) docker-compose up -d --build
  3) docker-compose up -d <servicio>
  4) docker-compose up -d --build <servicio>
  5) Ver servicios
  6) Reiniciar servicios
  9) Retroceder
  0) Salir
  
EOF
        read -r -p "Opción: " opt
        case "$opt" in
            1) action_up_simple ;;
            2) action_up_build ;;
            3) action_up_partial ;;
            4) action_up_partial_build ;;
            5) show_header; show_services; pause ;;
            6) menu_restart ;;
            9) return ;;
            0) exit 0 ;;
            *) warn "Opción no válida"; pause ;;
        esac
    done
}

# ============================================================
# MENÚ - DOWN
# ============================================================

menu_down() {
    while true; do
        show_header
        cat <<EOF
═══════════════════════════════════════════════════════════
  DETENER SERVICIOS
═══════════════════════════════════════════════════════════

  1) docker-compose down
  2) docker-compose down -v
  3) docker-compose stop
  4) docker-compose stop <servicio>
  5) Ver servicios
  
  9) Retroceder
  0) Salir
  
EOF
        read -r -p "Opción: " opt
        case "$opt" in
            1) action_down ;;
            2) action_down_volumes ;;
            3) action_stop ;;
            4) action_stop_partial ;;
            5) show_header; show_services; pause ;;
            9) return ;;
            0) exit 0 ;;
            *) warn "Opción no válida"; pause ;;
        esac
    done
}

menu_restart() {
    while true; do
        show_header
        cat <<EOF
═══════════════════════════════════════════════════════════
  REINICIAR SERVICIOS
═══════════════════════════════════════════════════════════

  1) docker-compose restart (todos)
  2) docker-compose restart <servicio>
  3) Ver servicios

  9) Retroceder
  0) Salir

EOF

        read -r -p "Opción: " opt
        case "$opt" in
            1) action_restart_all ;;
            2) action_restart_partial ;;
            3) show_header; show_services; pause ;;
            9) return ;;
            0) exit 0 ;;
            *) warn "Opción no válida"; pause ;;
        esac
    done
}

# ============================================================
# MENÚ - CONNECT
# ============================================================

menu_connect() {
    while true; do
        show_header
        cat <<EOF
═══════════════════════════════════════════════════════════
  CONECTAR A CONTENEDORES
═══════════════════════════════════════════════════════════

  1) docker-compose exec <servicio> /bin/bash
  2) docker-compose exec <servicio> /bin/sh
  3) docker exec -it <contenedor> /bin/bash
  4) docker exec -it <contenedor> /bin/sh
  5) Ver servicios
  6) Ver contenedores
  
  9) Retroceder
  0) Salir
  
EOF
        read -r -p "Opción: " opt
        case "$opt" in
            1) action_connect_service_bash ;;
            2) action_connect_service_sh ;;
            3) action_connect_container_bash ;;
            4) action_connect_container_sh ;;
            5) show_header; show_services; pause ;;
            6) show_header; show_containers; pause ;;
            9) return ;;
            0) exit 0 ;;
            *) warn "Opción no válida"; pause ;;
        esac
    done
}

# ============================================================
# MENÚ - LOGS
# ============================================================

menu_logs() {
    while true; do
        show_header
        cat <<EOF
═══════════════════════════════════════════════════════════
  LOGS
═══════════════════════════════════════════════════════════

  1) docker-compose logs -f (todos)
  2) docker-compose logs -f <servicio>
  3) Ver servicios
  
  9) Retroceder
  0) Salir
  
EOF
        read -r -p "Opción: " opt
        case "$opt" in
            1) action_logs_all ;;
            2) action_logs_partial ;;
            3) show_header; show_services; pause ;;
            9) return ;;
            0) exit 0 ;;
            *) warn "Opción no válida"; pause ;;
        esac
    done
}

# ============================================================
# MENÚ PRINCIPAL
# ============================================================

menu_main() {
    while true; do
        detect_docker
        find_compose_file
        show_header
        
        cat <<EOF
═══════════════════════════════════════════════════════════
  MENÚ PRINCIPAL
═══════════════════════════════════════════════════════════

  1) Arrancar servicios (UP)
  2) Detener servicios (DOWN)
  3) Conectar a contenedor
  4) Ver servicios
  5) Ver contenedores
  6) Logs
  7) Factory Reset
  8) Limpieza completa (DOWN -v + Factory Reset)
  9) Redetectar Docker
  
  0) Salir
  
EOF
        read -r -p "Opción: " opt
        case "$opt" in
            1) menu_up ;;
            2) menu_down ;;
            3) menu_connect ;;
            4) show_header; show_services; pause ;;
            5) show_header; show_containers; pause ;;
            6) menu_logs ;;
            7) action_factory_reset ;;
            8) action_clean_all ;;
            9) detect_docker; find_compose_file; success "Redetección completada"; pause ;;
            0) success "¡Hasta luego!"; exit 0 ;;
            *r* | *R*) menu_restart ;;
            *) warn "Opción no válida"; pause ;;
        esac
    done
}

# ============================================================
# MAIN
# ============================================================

if ! detect_docker; then
    error "Docker no está disponible"
    exit 1
fi

if ! find_compose_file; then
    error "No se encontró docker-compose.yml"
    exit 1
fi

menu_main