'use client'

import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function InfoDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Información" />
        }
      >
        <Info className="size-4 text-muted-foreground" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 pr-10 border-b border-border shrink-0">
          <DialogTitle className="text-base font-bold">Polla Mundial 2026</DialogTitle>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-4 py-4 space-y-5 text-sm">

          {/* Inscripcion y Premios */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 px-3 py-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Inscripción</p>
              <p className="font-semibold text-foreground text-base">50 Bs</p>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Premios</p>
              <p className="text-foreground leading-relaxed text-sm">
                1º: <span className="font-semibold">60%</span> - 2º: <span className="font-semibold">25%</span> - 3º: <span className="font-semibold">15%</span>
              </p>
            </div>
          </div>

          {/* App */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">App</h3>
            <ul className="space-y-1.5 text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary shrink-0 mt-0.5">•</span>
                <span>Puedes registrar o editar una predicción hasta una hora antes del inicio del partido, luego se bloquea.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0 mt-0.5">•</span>
                <span>En <strong className="text-foreground">Home</strong> ves los partidos recién terminados, en progreso y pendientes ordenados cronológicamente.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0 mt-0.5">•</span>
                <span>En <strong className="text-foreground">Matches</strong> ves todos los partidos clasificados por grupos.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0 mt-0.5">•</span>
                <span>En <strong className="text-foreground">Leaderboard</strong> ves el ranking y puedes hacer click en cualquier usuario para ver sus predicciones pasadas.</span>
              </li>
            </ul>
          </section>

          {/* Reglamento */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Reglamento</h3>
            <ul className="space-y-1.5 text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary shrink-0 mt-0.5">•</span>
                <span>Una predicción por partido, hasta una hora antes del inicio.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0 mt-0.5">•</span>
                <span>La predicción aplica al resultado de los 90/120 min jugados.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0 mt-0.5">•</span>
                <span>En partidos de eliminación, si predices empate puedes marcar quién gana en penales.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0 mt-0.5">•</span>
                <span>En caso de empate en puntos, el desempate es por cantidad de resultados exactos acertados. Si persiste el empate, comparten el puesto.</span>
              </li>
            </ul>
          </section>

          {/* Puntuacion */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Puntuación</h3>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-3 py-2 text-muted-foreground">Resultado exacto</td>
                    <td className="px-3 py-2 text-right font-bold text-primary">10 pts</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-3 py-2 text-muted-foreground">Solo diferencia de gol</td>
                    <td className="px-3 py-2 text-right font-bold text-primary">5 pts</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-3 py-2 text-muted-foreground">Solo acertar al ganador</td>
                    <td className="px-3 py-2 text-right font-bold text-primary">2 pts</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-muted-foreground">Bonus penales (ganador)</td>
                    <td className="px-3 py-2 text-right font-bold text-primary">+3 pts</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Ejemplos */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Ejemplos</h3>
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 px-3 py-2.5">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Resultado: Argentina 2-1 Francia</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">2-1</span>
                    <span className="font-semibold text-primary">10 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1-0, 3-2</span>
                    <span className="font-semibold text-primary">5 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">2-0, 4-1</span>
                    <span className="font-semibold text-primary">2 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1-1, 0-1</span>
                    <span className="text-muted-foreground/60">0 pts</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 px-3 py-2.5">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Resultado: Argentina 2-2 Francia · Arg gana penales</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">2-2 + Arg penales</span>
                    <span className="font-semibold text-primary">13 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">2-2 + Fra penales</span>
                    <span className="font-semibold text-primary">10 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1-1 + Arg penales</span>
                    <span className="font-semibold text-primary">8 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1-1 + Fra penales</span>
                    <span className="font-semibold text-primary">5 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1-0, 0-1</span>
                    <span className="text-muted-foreground/60">0 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </DialogContent>
    </Dialog>
  )
}
