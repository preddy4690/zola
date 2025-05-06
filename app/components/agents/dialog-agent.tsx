import { useBreakpoint } from "@/app/hooks/use-breakpoint"
import { useUser } from "@/app/providers/user-provider"
import { AgentSummary } from "@/app/types/agent"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { PopoverContentAuth } from "../chat-input/popover-content-auth"
import { AgentDetail } from "./agent-detail"

type DialogAgentProps = {
  id: string
  name: string
  description: string
  avatar_url?: string | null
  example_inputs: string[]
  creator_id?: string
  className?: string
  isAvailable: boolean
  slug: string
  onAgentClick?: (agentId: string) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  randomAgents: AgentSummary[]
  trigger?: React.ReactNode
}

export function DialogAgent({
  id,
  name,
  description,
  creator_id,
  avatar_url,
  example_inputs,
  slug,
  className,
  isAvailable,
  onAgentClick,
  isOpen,
  onOpenChange,
  randomAgents,
  trigger = null,
}: DialogAgentProps) {
  const isMobile = useBreakpoint(768)
  const { user } = useUser()

  const handleOpenChange = (open: boolean) => {
    if (!isAvailable) {
      return
    }

    window.history.replaceState(null, "", `/agents/${slug}`)
    onOpenChange(open)
  }

  const handleClick = () => {
    if (isAvailable) {
      handleOpenChange(true);
    }
  }

  const defaultTrigger = (
    <div
      className={cn(
        "bg-secondary hover:bg-accent cursor-pointer rounded-xl p-4 transition-colors w-full",
        className,
        !isAvailable && "cursor-not-allowed opacity-50"
      )}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="bg-muted size-16 overflow-hidden rounded-full">
            {avatar_url ? (
              <Avatar className="h-full w-full object-cover">
                <AvatarImage
                  src={avatar_url}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              </Avatar>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full" />
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 text-left">
          <h3 className="text-foreground truncate text-base font-medium">
            {name}
          </h3>

          <p className="text-foreground line-clamp-3 text-sm md:line-clamp-2">
            {description}
          </p>

          {creator_id && (
            <p className="text-muted-foreground mt-2 text-xs">
              By {creator_id}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  if (!user) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          {trigger || defaultTrigger}
        </PopoverTrigger>
        <PopoverContentAuth />
      </Popover>
    )
  }

  const renderContent = (isMobile?: boolean) => (
    <AgentDetail
      id={id}
      slug={slug}
      name={name}
      description={description}
      example_inputs={example_inputs}
      creator_id={creator_id}
      avatar_url={avatar_url}
      onAgentClick={onAgentClick}
      randomAgents={randomAgents}
      isMobile={isMobile}
    />
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>
          {trigger || defaultTrigger}
        </DrawerTrigger>
        <DrawerContent className="bg-background border-border">
          {renderContent(isMobile)}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent
        className="[&>button:last-child]:bg-background max-w-[600px] gap-0 overflow-hidden rounded-3xl p-0 shadow-xs [&>button:last-child]:rounded-full [&>button:last-child]:p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">{name}</DialogTitle>
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}
