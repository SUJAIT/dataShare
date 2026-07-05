; Custom NSIS script - automatically picked up by electron-builder
; This runs extra commands during install/uninstall.
; Goal: open the firewall for DataShare automatically, so the person
; installing it never has to touch Windows Firewall settings manually.

!macro customInstall
  DetailPrint "Adding Windows Firewall rule for DataShare..."
  nsExec::ExecToLog 'netsh advfirewall firewall delete rule name="DataShare"'
  nsExec::ExecToLog 'netsh advfirewall firewall add rule name="DataShare" dir=in action=allow program="$INSTDIR\DataShare.exe" enable=yes profile=any'
  nsExec::ExecToLog 'netsh advfirewall firewall add rule name="DataShare Port 3000" dir=in action=allow protocol=TCP localport=3000 profile=any'
!macroend

!macro customUnInstall
  DetailPrint "Removing Windows Firewall rule for DataShare..."
  nsExec::ExecToLog 'netsh advfirewall firewall delete rule name="DataShare"'
  nsExec::ExecToLog 'netsh advfirewall firewall delete rule name="DataShare Port 3000"'
!macroend